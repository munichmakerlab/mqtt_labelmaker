const tmp = require('tmp');
const execAsync = require('exec-async');
const mqtt = require('mqtt')
const PdfPrinter = require('pdfmake');
const fs = require('fs');
const { exit } = require('process');

const config = require('../config.json');
var fonts = require('./default_fonts');
var pdf = new PdfPrinter(fonts);

if (!config.base_topic) {
    console.error("No base topic set. Please provide a valid 'config.json' file.");
    exit(1);
}

async function makeLabel(content, template, dry_run=false) {
    let tmpfile;
    let tmppdf;
    if (dry_run) {
        tmppdf = "dryrun.pdf";
    } else {
        tmpfile = tmp.fileSync({postfix: '.pdf' });
        tmppdf = tmpfile.name;
    }
    
    var docDefinition = await template.render(content);
    var pdfDoc = pdf.createPdfKitDocument(docDefinition);
    pdfDoc.pipe(fs.createWriteStream(tmppdf));
    pdfDoc.end();

    if (!dry_run) {
        var args = [tmppdf];
        if (config.printer) {
            args += ['-d', config.printer];
        }
        for (opt in config.printer_options) {
            args += ['-o', opt];
        }
        execAsync("lp", args)
            .then(console.log)
            .catch(console.error)
            .finally(tmpfile.removeCallback);
    }
}

var client = mqtt.connect(config.credentials);
client.on("connect", function (err) {
    client.subscribe(config.base_topic+"#");
});
 
client.on("message", function (topic, payload) {
    let name = topic.substr(config.base_topic.length);
    if (name == "fonts") {
        console.error("Label requested for invalid template name 'fonts'");
        return;
    }
    let template = require('../templates/'+name);
    if (template) {
        makeLabel(JSON.parse(payload), template);
    } else {
        console.error("Label requested for unknown template '"+name+"'");
    }
});

client.on("error", function (err) {
    console.error(err);
});

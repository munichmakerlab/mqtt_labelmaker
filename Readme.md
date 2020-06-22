# MQTT Labelmaker

Print labels from MQTT input using predefined [pdfmake](http://pdfmake.org/) templates.

## Setup

#### Config file
Before running, provide a `config.json` file in the root directory.
* `credentials`: MQTT connection settings as taken by the [mqtt](https://www.npmjs.com/package/mqtt) library on connect.
* `base_topic`: The root topic to listen on. Will try to match any subtopic against the given templates.
* `printer`: The name of the printer to use as given by `lpstat -p`..
* `printer_options`: Any additional printer options to pass with the print job. For supported values run `lpoptions -p Printer_Name -l`

#### Templates
Put your templates in the `/templates` subfolder. Each template consists of one javascript file, that should expose a `async function render(input)` that returns a pdfmake document definition.

For an examples see [munichmakerlab/mqtt_labelmaker_templates](https://github.com/munichmakerlab/mqtt_labelmaker_templates).

## Run
```
npm install
node start
```

const MqttHelper = require('./mqtt-helper');
const Logger = require('./logger');

let mqttHelper;
let topics;
let onStateChangedCallback;

const CMD_TYPES = {
    MODE: 'mode',
    TEMPERATURE: 'temp',
    FAN: 'fan',
    SWING: 'swing',
	DISPLAY: 'display',
	JET: 'jet',
	NANOG: 'nanog'
};

const generateRandomNumber = (len) => Math.floor(Math.random() * Math.pow(10, len));

const generateClientId = () => `an${generateRandomNumber(16)}${generateRandomNumber(5)}`;

const onConnected = () => {
    Logger.logInfo('MirAIe broker connected.');
    mqttHelper.subscribe(topics, { qos: 0 });
}

const onMessageReceieved = (topic, payload) => {
    if (onStateChangedCallback) {
        onStateChangedCallback(topic, payload);
    }
};

const onPublishCompleted = (e) => {
    if (e) {
        console.error('Error publishing message to MirAIe. ' + e);
    }
}

const buildBasePayload = (device) => {
    return {
        "ki": 1,
        "cnt": "an",
        "sid": "1"
    };
};

const getCommandType = topic => {
    if (topic.endsWith('/mode/set')) {
        return CMD_TYPES.MODE;
    }

    if (topic.endsWith('/temp/set')) {
        return CMD_TYPES.TEMPERATURE;
    }

    if (topic.endsWith('/fan/set')) {
        return CMD_TYPES.FAN;
    }
	
    if (topic.endsWith('/swing/set')) {
        return CMD_TYPES.SWING;
    }

    if (topic.endsWith('/display/set')) {
        return CMD_TYPES.DISPLAY;
    }
	
    if (topic.endsWith('/jet/set')) {
        return CMD_TYPES.JET;
    }
	
    if (topic.endsWith('/nanog/set')) {
        return CMD_TYPES.NANOG;
    }
};

const generateModeMessages = (basePayload, command, topic) => {
    const powerMode = command == "off" ? "off" : "on";
    const acMode = command == "fan_only" ? "fan" : command;

    const powerMessage = {
        topic,
        payload: {
            ...basePayload,
            ps: powerMode
        }
    };

    const modeMessage = {
        topic,
        payload: {
            ...basePayload,
            acmd: acMode
        }
    };

    return [powerMessage, modeMessage];
}

const generateTemperatureMessage = (basePayload, command, topic) => {
    return [{
        topic,
        payload: {
            ...basePayload,
            "actmp": command
        }
    }];
};

const generateFanMessage = (basePayload, command, topic) => {
    return [{
        topic,
        payload: {
            ...basePayload,
            acfs: command
        }
    }];
};

const generateSwingMessage = (basePayload, command, topic) => {
    return [{
        topic,
        payload: {
            ...basePayload,
            acvs: parseInt(command)
        }
    }];
};

const generateDisplayMessage = (basePayload, command, topic) => {
    return [{
        topic,
        payload: {
            ...basePayload,
            acdc: command
        }
    }];
};

const generateJetMessage = (basePayload, command, topic) => {
    return [{
        topic,
        payload: {
            ...basePayload,
            acpm: command
        }
    }];
};

const generateNanogMessage = (basePayload, command, topic) => {
    return [{
        topic,
        payload: {
            ...basePayload,
            acng: command
        }
    }];
};

const generateMessages = (topic, command, cmdType, basePayload) => {
    switch (cmdType) {
        case CMD_TYPES.MODE:
            return generateModeMessages(basePayload, command.toLowerCase(), topic);
        case CMD_TYPES.TEMPERATURE:
            return generateTemperatureMessage(basePayload, command.toLowerCase(), topic);
        case CMD_TYPES.FAN:
            return generateFanMessage(basePayload, command.toLowerCase(), topic);
        case CMD_TYPES.SWING:
            return generateSwingMessage(basePayload, command.toLowerCase(), topic);
        case CMD_TYPES.DISPLAY:
            return generateDisplayMessage(basePayload, command.toLowerCase(), topic);
        case CMD_TYPES.JET:
            return generateJetMessage(basePayload, command.toLowerCase(), topic);
        case CMD_TYPES.NANOG:
            return generateNanogMessage(basePayload, command.toLowerCase(), topic);
    }
    return [];
};

module.exports = MiraieBroker;

function MiraieBroker(commandTopics, onStateChanged) {
    mqttHelper = new MqttHelper();
    topics = commandTopics;
    onStateChangedCallback = onStateChanged;
}

MiraieBroker.prototype.connect = function (constants, username, password) {
    const clientId = generateClientId();
    const useSsl = 'true';
    mqttHelper.connect(constants.mirAIeBrokerHost, constants.mirAIeBrokerPort, clientId, useSsl, username, password, false, onConnected, onMessageReceieved);
};

MiraieBroker.prototype.publish = function (device, command, commandTopic) {
    const basePayload = buildBasePayload(device);
    const cmdType = getCommandType(commandTopic);
    const messages = generateMessages(device.controlTopic, command, cmdType, basePayload);
    messages.map(m => mqttHelper.publish(m.topic, m.payload, 0, false, onPublishCompleted));
};

MiraieBroker.prototype.disconnect = function() {
    mqttHelper.disconnect();
};
const mqtt = require('mqtt')

module.exports = MqttHelper;

function MqttHelper() { 
    this._client = null;
}

MqttHelper.prototype.connect = function (host, port, clientId, useSSL, username, password, clean, onConnect, onMessage) {
    const protocol = useSSL === 'true' ? 'tls' : 'mqtt';
    const connectUrl = `${protocol}://${host}:${port}`;

    this._client = mqtt.connect(connectUrl, {
        clientId,
        clean,
        username,
        password,
        connectTimeout: 4000,
        reconnectPeriod: 1000,
    });

    if (onConnect) {
        this._client.on('connect', onConnect);
    }

    if (onMessage) {
        this._client.on('message', onMessage);
    }
};

MqttHelper.prototype.disconnect = function () {
    this._client.end();
};

MqttHelper.prototype.subscribe = function (topics, options) {
    this._client.subscribe(topics, options);
};

MqttHelper.prototype.publish = function (topic, payload, qos = 0, retain = false, onPublishCompleted) {
    const message = typeof (payload) === 'object'
        ? JSON.stringify(payload)
        : payload;

    this._client.publish(topic, message, { qos, retain }, onPublishCompleted);
};


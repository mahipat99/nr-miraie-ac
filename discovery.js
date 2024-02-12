/* 
module.exports = Discovery;

const generateConfigPayload = (device) => {
    const deviceName = device.name;
    const stateTopic = `miraie-ac/${deviceName}/state`;

    return {
        name: device.friendlyName,
        unique_id: deviceName,
        mode_cmd_t: `miraie-ac/${deviceName}/mode/set`,
        mode_stat_t: stateTopic,
        mode_stat_tpl: "{% set mode = value_json.acmd %}{% set power = value_json.ps %}{%- if power == 'off' -%} off {%- else -%} {{ 'fan_only' if mode == 'fan' else mode }} {%- endif -%}",
        avty_t: `miraie-ac/${deviceName}/availability`,
        pl_avail: "online",
        pl_not_avail: "offline",
        
        temp_cmd_t: `miraie-ac/${deviceName}/temp/set`,
        temp_stat_t: stateTopic,
        temp_stat_tpl: "{{ value_json.actmp }}",
        
        curr_temp_t: stateTopic,
        curr_temp_tpl: "{{ value_json.rmtmp }}",
        
        max_temp: "30",
        min_temp: "16",
        
        act_t: `miraie-ac/${deviceName}/action`,
        pow_cmd_t: `miraie-ac/${deviceName}/power/set`,
        
        fan_mode_cmd_t: `miraie-ac/${deviceName}/fan/set`,
        fan_mode_stat_t: stateTopic,
        fan_mode_stat_tpl: "{{ value_json.acfs }}",
        
        modes: ["auto", "cool", "dry", "fan_only", "off"],
        fan_modes: ["auto", "quiet", "low", "medium", "high"],

    };
}

function Discovery() {}

Discovery.prototype.generateDiscoMessage = function (device) {
    return {
        topic: `homeassistant/climate/${device.name}/config`,
        payload: generateConfigPayload(device),
    }
} */
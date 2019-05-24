const DATE_TIME_FORMAT_CLIENT = "DD.MM.YYYY HH:mm:ss";

const render = new function () {
    var _render = this;

    var templates = {};
    var getTemplate = function (id) {
        var template = templates[id];
        if (!template) {
            template = $('#' + id).html();
            templates[id] = template;
        }
        return String(template);
    };

    var processTemplate = function (id, values) {
        var template = getTemplate(id);
        for (var i in values) {
            if (values.hasOwnProperty(i)) {
                var replaceWhat = "{" + i + "}";
                var replaceWith = values[i];
                var processed = template.replace(replaceWhat, replaceWith);
                while (template !== processed) {
                    template = processed;
                    processed = template.replace(replaceWhat, replaceWith);
                }
            }
        }
        return template;
    };

    var createNode = function (data) {
        var node = $('<div class="card node" />');

        node.html(processTemplate("nodeTemplate", {
            id: data.id,
            name: data.name,
            executable: data.executable,
            command: data.command,
            type: state.nodeTypes[data.type],
            created: !!data.created && moment(data.created).format(DATE_TIME_FORMAT_CLIENT),
            updated: !!data.updated && moment(data.updated).format(DATE_TIME_FORMAT_CLIENT),
            started: !!data.started && moment(data.started).format(DATE_TIME_FORMAT_CLIENT),
            stopped: !!data.stopped && moment(data.stopped).format(DATE_TIME_FORMAT_CLIENT),
            cpu: data.stats && data.stats.cpu !== undefined ? Math.round(data.stats.cpu || 0) + "%" : "-",
            memory: data.stats && data.stats.memory !== undefined ? (data.stats.memory / 1024 / 1024).toFixed(2) + "MB" : "-",
            startIcon: data.start ? "stop" : "play",
            startStyle: data.start ? "primary" : "success",
            badgeStyle: data.started ? "success" : data.start ? data.stopped ? "danger" : "warning" : "dark",
            startOrStopLabel: data.started ? "on" : data.start ? data.stopped ? "error" : "starting" : "off",
            startOrStopFn: data.start ? "stopNode" : "startNode"
        }));
        return node;
    };

    _render.showNodes = function (data) {
        var content = $("#contentArea");
        content.html("");
        var group = $('<div class="nodes" />');
        if (data.items.length) {
            for (var i = 0; i < data.items.length; i++) {
                group.append(createNode(data.items[i]));
            }
        }
        else {
            group.append($('<div class="placeholder">No records found</div>'));
        }
        content.append(group);
    };

    _render.showLogin = function () {
        $("#mainContentArea").html(processTemplate("loginTemplate", {}));
        var loginInput = $('#loginInput');
        var passwordInput = $('#passwordInput');
        loginInput.focus();
        loginInput.keyup(function (event) {
            if (event.keyCode === 13) {
                passwordInput.focus();
            }
        });
        passwordInput.keyup(function (event) {
            if (event.keyCode === 13) {
                api.login();
            }
        });
    };

    _render.showSystem = function () {
        $("#mainContentArea").html(processTemplate("systemTemplate", {
            version: window.frontendVersion
        }));
    };

    _render.showEnviromentVariables = function () {
        var content = $("#enviromentVariables");
        content.html("");
        var input1Col, input2Col;
        if (state.enviromentVariables.length) {
            var labels = $('<div class="form-group row labels" />');

            input1Col = $('<div class="col col-sm-5" />');
            var label1 = $('<label />');
            label1.html("Variable name");
            input1Col.append(label1);
            labels.append(input1Col);

            input2Col = $('<div class="col col-sm-5" />');
            var label2 = $('<label />');
            label2.html("Variable name");
            input2Col.append(label2);
            labels.append(input2Col);

            content.append(labels);
        }
        var setBtnClick = function (button, index) {
            button.click(function () {
                api.removeEnviromentVariable(index);
            });
        };

        var setUpdate = function (input1, input2, item) {
            input1.keyup(function () {
                item.name = input1.val();
                console.log(state.enviromentVariables);
            });
            input2.keyup(function () {
                item.value = input2.val();
                console.log(state.enviromentVariables);
            });
        };

        for (var i = 0; i < state.enviromentVariables.length; i++) {
            var item = state.enviromentVariables[i];
            var variable = $('<div class="form-group row" />');

            input1Col = $('<div class="col col-sm-5" />');
            var input1 = $('<input class="form-control" />');
            input1.val(item.name);
            input1Col.append(input1);
            variable.append(input1Col);

            input2Col = $('<div class="col col-sm-5" />');
            var input2 = $('<input class="form-control" />');
            input2.val(item.value);
            input2Col.append(input2);
            variable.append(input2Col);
            setUpdate(input1, input2, item);

            var buttonCol = $('<div class="col col-sm-2" />');
            var button = $('<button class="btn btn-danger pull-right" />');
            button.append(" Remove");
            setBtnClick(button, i);
            buttonCol.append(button);
            variable.append(buttonCol);

            content.append(variable);
        }
    };

    _render.renderNodeTypes = function (response) {
        var content = $("#nodeTypeSelect");
        var items = response.items || [];
        var options = "";
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            options += '<option value="' + item.id + '">' + item.name + '</option>';
        }
        content.html(options);
    };

    _render.showNodeConsole = function (data) {
        var content = $("#modalConsoleArea");
        content.html("");
        var output = $('<div class="console-output" />');
        output.html(data.output);
        var stats = $('<div class="console-stats" />');
        var cpu = data.stats && data.stats.cpu !== undefined ? Math.round(data.stats.cpu || 0) + "%" : "-";
        var memory = data.stats && data.stats.memory !== undefined ? (data.stats.memory / 1024 / 1024).toFixed(2) + "MB" : "-";
        stats.html("<span>CPU: " + cpu + "</span><span class='pull-right'>RAM: " + memory + "</span>");
        content.append(stats);
        content.append(output);
    };

    _render.showSystemInfo = function (data) {
        var stats = data.data;
        var usedmem = stats.totalmem - stats.freemem;
        $("#infoArea").html(processTemplate("infoTemplate", {
            cpuUsage: Math.floor(stats.cpuUsage * 100),
            cores: stats.cpus.length,
            cpuSpeed: (stats.cpus[0].speed / 1000).toFixed(2),
            ramUsed: (usedmem / 1024 / 1024 / 1024).toFixed(2),
            ramTotal: (stats.totalmem / 1024 / 1024 / 1024).toFixed(2),
            ramUsage: Math.floor(usedmem / stats.totalmem * 100),
            uptime: (stats.uptime / 60 / 60).toFixed(2)
        }));

        var cpus = "";
        for (var i = 0; i < stats.cpus.length; i++) {
            var cpu = stats.cpus[i];
            cpus += processTemplate("infoModalCpuTemplate", {
                speed: (cpu.speed / 1000).toFixed(2),
                index: i,
                model: cpu.model
            });
        }

        var networkInterfaces = "";
        for (var key in stats.networkInterfaces) {
            if (stats.networkInterfaces.hasOwnProperty(key)) {
                var networkInterface = stats.networkInterfaces[key];
                var interface0 = networkInterface[0] || {};
                var interface1 = networkInterface[1] || {};
                networkInterfaces += processTemplate("infoModalNetworkInterfaceTemplate", {
                    name: key,
                    address0: interface0.address,
                    family0: interface0.family,
                    internal0: interface0.internal,
                    mac0: interface0.mac,
                    netmask0: interface0.netmask,
                    scopeid0: interface0.scopeid,
                    address1: interface1.address,
                    family1: interface1.family,
                    internal1: interface1.internal,
                    mac1: interface1.mac,
                    netmask1: interface1.netmask,
                    scopeid1: interface1.scopeid
                });
            }
        }

        $("#modalInfoArea").html(processTemplate("infoModalTemplate", {
            cpuUsage: Math.floor(stats.cpuUsage * 100),
            cores: stats.cpus.length,
            cpus: cpus,
            networkInterfaces: networkInterfaces,
            cpuSpeed: (stats.cpus[0].speed / 1000).toFixed(2),
            ramUsed: (usedmem / 1024 / 1024 / 1024).toFixed(2),
            ramFree: (stats.freemem / 1024 / 1024 / 1024).toFixed(2),
            ramTotal: (stats.totalmem / 1024 / 1024 / 1024).toFixed(2),
            ramUsage: Math.floor(usedmem / stats.totalmem * 100),
            uptime: (stats.uptime / 60 / 60).toFixed(2),
            diskUsed: (stats.space.used / 1024 / 1024 / 1024).toFixed(2),
            diskFree: (stats.space.free / 1024 / 1024 / 1024).toFixed(2),
            diskTotal: (stats.space.total / 1024 / 1024 / 1024).toFixed(2),
            diskUsage: Math.floor(stats.space.used / stats.space.total * 100)
        }));
    };
}();
const api = new function () {
    var _api = this;

    var systemInfoInterval;
    var nodesInterval;
    var renewTimeout;

    _api.init = function () {
        clearInterval(systemInfoInterval);
        clearInterval(nodesInterval);
        clearTimeout(renewTimeout);

        rest.getSelf(function (response) {
            const milliseconds = moment(sessionStorage.getItem("expirationDate")).diff(moment().add(1, "minute"), "millisecond");
            renewTimeout = setTimeout(api.renew, milliseconds > 0 ? milliseconds : 0);
            $('.hiddenToken').val(sessionStorage.getItem("token"));
            render.showSystem();
            _api.loadSystemInfo();
            rest.getNodeTypes(function (response) {
                state.nodeTypes = {};
                var items = response.items || [];
                for (i = 0; i < items.length; i++) {
                    var item = items[i];
                    state.nodeTypes[item.id] = item.name;
                }
                render.renderNodeTypes(response);
            });
            _api.loadNodes();
            systemInfoInterval = setInterval(_api.loadSystemInfo, 5000);
            nodesInterval = setInterval(_api.loadNodes, 15000);
        });
    };

    _api.showLogin = function () {
        clearInterval(systemInfoInterval);
        clearInterval(nodesInterval);
        clearTimeout(renewTimeout);
        render.showLogin();
    };

    _api.renew = function () {
        rest.renew(function (response) {
            sessionStorage.setItem("token", response.data.token);
            sessionStorage.setItem("expirationDate", response.data.expirationDate);
            const milliseconds = moment(response.data.expirationDate).diff(moment().add(1, "minute"), "millisecond");
            renewTimeout = setTimeout(api.renew, milliseconds > 0 ? milliseconds : 0);
        });
    };

    _api.login = function () {
        var loginInput = $('#loginInput');
        var passwordInput = $('#passwordInput');
        var login = loginInput.val();
        loginInput.val("");
        var password = passwordInput.val();
        passwordInput.val("");
        rest.login(login, password, function (response) {
            sessionStorage.setItem("token", response.data.token);
            sessionStorage.setItem("expirationDate", response.data.expirationDate);
            api.init();
        });
    };

    _api.logout = function () {
        rest.logout();
        sessionStorage.setItem("token", null);
        sessionStorage.setItem("expirationDate", null);
        api.init();
    };

    _api.loadNodes = function () {
        rest.getNodes(function (response) {
            state.nodes = response.items;
            if (!state.showNodeModal) {
                $("#nodeNameInput").val("Node " + (state.nodes.length + 1));
            }
            render.showNodes(response);
        });
    };

    _api.loadSystemInfo = function () {
        rest.getSystemInfo(render.showSystemInfo);
    };

    _api.openNodeModal = function (id) {
        state.nodeId = id;
        state.showNodeModal = true;
        var node, i;
        for (i = 0; i < state.nodes.length; i++) {
            if (state.nodes[i].id === id) {
                node = state.nodes[i];
                break;
            }
        }
        if (node) {
            state.enviromentVariables = [];
            for (i in node.env) {
                if (node.env.hasOwnProperty(i)) {
                    state.enviromentVariables.push({name: i, value: node.env[i]});
                }
            }
            $("#nodeNameInput").val(node.name);
            $("#nodeTypeSelect").val(node.type);
            $("#nodeExecutableInput").val(node.executable);
            $("#nodeCommandInput").val(node.command);
        }
        else {
            node = {};
            const nr = state.nodes.length + 1;
            state.enviromentVariables = [{name: "port", value: String(3000 + nr)}];
            $("#nodeNameInput").val("Node " + nr);
            $("#nodeTypeSelect").val("1");
            $("#nodeExecutableInput").val("index.js");
            $("#nodeCommandInput").val("");
        }
        render.showEnviromentVariables();
    };

    _api.createNode = function () {
        var name = $("#nodeNameInput").val();
        var type = $("#nodeTypeSelect").val();
        var executable = $("#nodeExecutableInput").val();
        var command = $("#nodeCommandInput").val();
        if (name && type) {
            var env = {};
            for (var i = 0; i < state.enviromentVariables.length; i++) {
                var variable = state.enviromentVariables[i];
                env[variable.name] = variable.value;
            }
            if (state.nodeId) {
                rest.updateNode({
                    id: state.nodeId,
                    name: name,
                    type: type,
                    executable: executable,
                    command: command,
                    env: env
                }, _api.loadNodes);
            }
            else {
                rest.createNode({
                    name: name,
                    type: type,
                    executable: executable,
                    command: command,
                    env: env
                }, _api.loadNodes);
            }
        }
        else {
            return false;
        }
    };

    _api.removeNodeConfirmation = function (id) {
        state.nodeId = id;
    };

    _api.removeNode = function (id) {
        rest.deleteNode(id, _api.loadNodes);
    };

    _api.startNode = function (id) {
        rest.startNode(id, _api.loadNodes);
    };

    _api.stopNode = function (id) {
        rest.stopNode(id, _api.loadNodes);
    };

    var consoleTimeout;
    var updateConsole = function () {
        clearTimeout(consoleTimeout);
        rest.getNode(state.nodeId, function (response) {
            render.showNodeConsole(response.data);
            consoleTimeout = setTimeout(updateConsole, 5000);
        });
    };
    _api.openNodeConsole = function (id) {
        state.nodeId = id;
        var node = {};
        for (var i = 0; i < state.nodes.length; i++) {
            if (state.nodes[i].id === id) {
                node = state.nodes[i];
                break;
            }
        }
        render.showNodeConsole(node);
        updateConsole();
    };

    _api.closeNodeConsole = function () {
        state.nodeId = null;
        clearTimeout(consoleTimeout);
    };

    _api.addEnviromentVariable = function () {
        state.enviromentVariables.push({});
        render.showEnviromentVariables();
    };

    _api.removeEnviromentVariable = function (index) {
        state.enviromentVariables.splice(index, 1);
        render.showEnviromentVariables();
    };

    _api.openNodeUpload = function (id) {
        state.nodeId = id;
        $("#nodeUploadModalError").hide(0);
        $("#uploadZipInput").val("");
        $("#hiddenNodeId").val(id);
        $("#uploadFrame").attr('src', 'about:blank');
    };

    _api.nodeUploadCallback = function (iframe) {
        var iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
        var body = iframeDocument.getElementsByTagName("body")[0];
        var content = body ? body.innerText : null;
        if (content) {
            try {
                var parsed = JSON.parse(content);
                if (parsed.data) {
                    $("#nodeUploadModal").modal('hide');
                }
                else {
                    var uploadError = $("#nodeUploadModalError");
                    uploadError.text(parsed.message ? parsed.message : "Error uploading file");
                    uploadError.show();
                }
            }
            catch (e) {
                console.error(e);
            }
        }
    };

    _api.nodeDownloadFiles = function (id) {
        var downloadUrl = "/download/?id=" + id + "&token=" + sessionStorage.getItem("token");
        $("#downloadFrame").attr('src', downloadUrl);
    };
}();

$(document).ready(api.init);
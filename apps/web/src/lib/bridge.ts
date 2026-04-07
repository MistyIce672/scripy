export const bridgeScript = `
<script>
(function() {
  var pending = {};

  window.__nativeBridge = {
    openExternal: function(url) {
      return new Promise(function(resolve) {
        var id = Math.random().toString(36).slice(2);
        var msg = JSON.stringify({ id: id, type: 'openExternal', url: url });
        pending[id] = resolve;
        window.parent.postMessage(msg, '*');
      });
    },
    copyToClipboard: function(text) {
      return new Promise(function(resolve) {
        var id = Math.random().toString(36).slice(2);
        var msg = JSON.stringify({ id: id, type: 'copyToClipboard', text: text });
        pending[id] = resolve;
        window.parent.postMessage(msg, '*');
      });
    }
  };

  window.__bridge = {
    getData: function(key) {
      return new Promise(function(resolve) {
        var id = Math.random().toString(36).slice(2);
        var msg = JSON.stringify({ id: id, type: 'getData', key: key });
        pending[id] = resolve;
        window.parent.postMessage(msg, '*');
      });
    },
    setData: function(key, value) {
      return new Promise(function(resolve) {
        var id = Math.random().toString(36).slice(2);
        var msg = JSON.stringify({ id: id, type: 'setData', key: key, value: value });
        pending[id] = resolve;
        window.parent.postMessage(msg, '*');
      });
    },
    getRoomData: function(key) {
      return new Promise(function(resolve) {
        var id = Math.random().toString(36).slice(2);
        var msg = JSON.stringify({ id: id, type: 'getRoomData', key: key });
        pending[id] = resolve;
        window.parent.postMessage(msg, '*');
      });
    },
    setRoomData: function(key, value) {
      return new Promise(function(resolve) {
        var id = Math.random().toString(36).slice(2);
        var msg = JSON.stringify({ id: id, type: 'setRoomData', key: key, value: value });
        pending[id] = resolve;
        window.parent.postMessage(msg, '*');
      });
    },
    onRoomChange: function(callback) {
      window.__roomCallback = callback;
    }
  };

  window.addEventListener('message', function(e) {
    try {
      var data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      if (data.type === 'response' && pending[data.id]) {
        pending[data.id](data.result);
        delete pending[data.id];
      }
      if (data.type === 'roomUpdate' && window.__roomCallback) {
        window.__roomCallback(data.key, data.value);
      }
    } catch(err) {}
  });
})();
</script>`;

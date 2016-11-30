function performAjax(formId, url, method, targetPre){
  var httpData = $("#" + formId).serialize();
  console.log(httpData);
  $.ajax({
    url: url,
    type: method,
    data: httpData,
    success: function(data, textStatus, jqXHR){
      targetPre.innerHTML = syntaxHighlight(JSON.stringify(data, null, 2));
    },
    error: function(jqXHR, textStatus, errorThrown){
      targetPre.innerHTML = syntaxHighlight(JSON.stringify(jqXHR.responseJSON, null, 2));
    }
  });
}


function syntaxHighlight(json) {
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
   return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      var cls = 'number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'key';
        } else {
          cls = 'string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'boolean';
      } else if (/null/.test(match)) {
        cls = 'null';
      }

      return '<span class="' + cls + '">' + match + '</span>';
    });
}
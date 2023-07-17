/*
By 
dsci4 https://github.com/dsci4-hacks
Based on work by kiki67100 https://gist.github.com/kiki67100
Tested on Google Chrome 
Open Microsoft teams web version, select a conversation
Open Developper tools and copy / paste 
Works in July 2023 may not work in the future...
*/


(function() {
  var JQ = jQuery("iframe").contents();
  var queue = [];
  var last_processed = (new Date()).getTime();
  var loading = true;
  var my_name = null;

  var mouse = function(which, element) {
    var evt = element.ownerDocument.createEvent('MouseEvents');
    evt.initMouseEvent(
      which,
      true,
      true,
      element.ownerDocument.defaultView,
      1,
      0,
      0,
      0,
      0,
      false,
      false,
      false,
      false,
      1,
      null
    );
    element.dispatchEvent(evt);
  };

  var repeat = setInterval(function() {
    if (loading) {
      if (JQ.find("div.pending").length === 0) {
        loading = false;
        $(JQ.find('div[data-mid]').get().reverse()).each(function() {
          var id = $(this).attr('data-mid');
          if (isNaN(id)) return;

          if ($(this).find("[data-tid=message-undo-delete-btn]").length > 0) return;

          queue.push(this);
          $(this).css({
            'outline': '5px solid blue'
          });
        });
      } else {
        return;
      }
    }

    while (true) {
      if (queue.length > 0) {
        var item = queue.shift();
        if (my_name && my_name != $(item).find("[data-tid=message-author-name]").text()) {
          $(item).css({
            'outline': '5px solid red'
          });
        } else {
          $(item).css({
            'outline': '5px solid blue'
          });

          var messageId = $(item).attr("data-mid");
          var messageContent = JQ.find(`#content-${messageId}`);
          if (messageContent.length > 0) {
            mouse('contextmenu', messageContent[0]);

            var delete_button = JQ.find("[data-tid=message-actions-delete]")[0];
            if (delete_button) {
              console.log("Delete ID " + messageId);
              $(item).css({
                'outline': '5px solid green'
              });
              my_name = $(item).find("[data-tid=message-author-name]").text();
              console.log(["My name is: ", my_name]);
              mouse('click', delete_button);
              last_processed = (new Date()).getTime();
              break;
            } else {
              $(item).css({
                'outline': '5px solid red'
              });
            }
          } else {
            console.log("Message content element not found for item:");
            console.log(item);
          }

          setTimeout(function() {
            $(item)[0].scrollIntoView(false);
          }, 100);
        }
      } else {
        break;
      }
    }

    if (queue.length <= 0) {
      loading = true;
    }

    if (last_processed < (new Date()).getTime() - 120000) {
      clearInterval(repeat);
      console.log("Finished, nothing new has come up for 1 minute 15 seconds.");
    }
  }, 3000);
})();

(function(){
  var PORT = 4000;

  App = function(socket){
    return {
      socket: socket,
      container: $('.container.logs'),
      regexContainer: $('#regex'),
      clearBtn: $('.clearLogBtn'),
      bodyElement: $('body')[0],
      allVisible: true,
      autoScroll: true,

      clearLogs: function(){
          this.container.empty();
      },
      bindEvents: function(){
        $('#autoScroll').click(_.bind(function(e){
          if ($(e.target).is(':checked')){
            this.autoScroll = true;
          } else {
            this.autoScroll = false;
          }
        }, this));

        this.clearBtn.click(this.clearLogs);

        this.regexContainer.keyup(_.bind(function(e){
          var searchVal = $(e.target).val();
          if(searchVal === '') {
            if(!this.allVisible){
              $('.log_line').show(); //OPTIMIZE
              this.allVisible = true;
            }
          }
          else {
            this.filter( $('.log_line'), new RegExp(searchVal) );
          }
          if(e.stopPropagation) e.stopPropagation();   // Stops Bubbling up to Ancestor elements
        }, this));
      },
      filter: function($logs, re){
        $logs.each(_.bind(function(index, log){
            match = re.exec(log.innerHTML);
            if(match){
              $(log).show(); //Add divs to make the matched part of different color
            }
            else{
              $(log).hide();
              this.allVisible = false;
            }
          }, this));
      },

      //ShortCut-Keys
      handleKeyUp: function(key){
        switch(parseInt(key.which,10)){
          case 71:// Press 'g' or 'G' to clear the logs
          case 103:
            this.clearLogs();
            break;
          default:
            break;
        }
      },
      autoScrollToBottom: function(){
        if(this.autoScroll)
          this.bodyElement.scrollTop = this.bodyElement.scrollHeight;
      },

      addItem: function(data){

        // Adding based on indentation
        if(data.value[0] == ' '){
          this.lastItem.html(this.lastItem.html() + '\n' + ansi2html(data.value));
        }
        else{
          newItem = $('<div class="log_line">' + ansi2html(data.value) + '</div>');
          this.lastItem = newItem.appendTo(this.container);
        }

        //Filtering out on search
        searchVal = $('#regex').val();
        if(searchVal !== '') {
          this.filter(this.lastItem, new RegExp(searchVal));
        }

        // Auto scrolling
        this.autoScrollToBottom();
      },
      handleFilename: function(data){
        $('div.filename').text('Tailing: ' + data.value);
        this.clearLogs();
      },
      setupSocketListeners: function(){
        // Appends new-data into the container
        this.socket.on('new-data', this.addItem);
        this.socket.on('filename', this.handleFilename);
      },
      main: function(){
        // Binding Events
        this.bindEvents();

        // Binding Shortcuts
        $(document).keyup(this.handleKeyUp);

        // Binding Socket Events
        this.setupSocketListeners();
        this.lastItem = $('<div class="log_line"></div>').appendTo(this.container);
      }
    };
  };

  $(document).ready(function(){
    var socket = io.connect('http://localhost:'+PORT);
    myapp = new App(socket);
    _.bindAll(myapp, 'addItem', 'autoScrollToBottom', 'handleKeyUp', 'handleFilename', 'clearLogs');
    myapp.main();
  });
})();

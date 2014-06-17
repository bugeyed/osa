
 var socket = io.connect('http://raspberrypi:8000');
  socket.on('load:outlets', function (data) {
console.log('we are here')
    for (var o = 0; o<data.outlets;o++) {
      $('<button class="outlet"></button>').attr('data-outlet', o).appendTo('.outlets');
    }
  });

  $('body').on('click', '.outlet', function(evt){
      var $this = $(this);      
      if ($this.hasClass('on')) {
        socket.emit('toggle:outlet:off', {outlet: $(this).attr('data-outlet')});
      } else {
        socket.emit('toggle:outlet:on', {outlet: $(this).attr('data-outlet')});
      }
      $this.toggleClass('on');
    });


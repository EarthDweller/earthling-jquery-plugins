/*
 .textarea-autosize {
      resize: none;
      overflow-y: hidden;
    }
*/
function textAreaAutosize(){
    var text = $('.textarea-autosize');

    text.each(function(){
        $(this).attr('rows',1);
        resize($(this));
    });

    text.on('input', function(){
        resize($(this));
    });

    function resize ($text) {
        $text.css('height', 'auto');
        $text.css('height', $text[0].scrollHeight+'px');
    }
}

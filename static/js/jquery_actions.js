$(document).ready(function(){

    //Main menu
    var name_item = $('#main_menu .nav-item');
    name_item.click(function () {
        name_item.removeClass('active');
        $(this).addClass('active');
    });
    $('#shared_variables li').hover(function(){
        $('#shared_variables li').removeClass("hovered");
        $(this).addClass("hovered");
    });
    $('#pageSubmenu li').hover(function(){
        $('#pageSubmenu li').removeClass("hovered");
        $(this).addClass("hovered");
    });

});


$(function() {
  var $tabButtonItem = $('#tab-button li'),
      $tabSelect = $('#tab-select'),
      $tabContents = $('.tab-contents'),
      activeClass = 'is-active';

  $tabButtonItem.first().addClass(activeClass);
  $tabContents.not(':first').hide();

  $tabButtonItem.find('a').on('click', function(e) {
    var target = $(this).attr('href');

    $tabButtonItem.removeClass(activeClass);
    $(this).parent().addClass(activeClass);
    $tabSelect.val(target);
    $tabContents.hide();
    $(target).show();
    e.preventDefault();
  });

  $tabSelect.on('change', function() {
    var target = $(this).val(),
        targetSelectNum = $(this).prop('selectedIndex');

    $tabButtonItem.removeClass(activeClass);
    $tabButtonItem.eq(targetSelectNum).addClass(activeClass);
    $tabContents.hide();
    $(target).show();
  });

});


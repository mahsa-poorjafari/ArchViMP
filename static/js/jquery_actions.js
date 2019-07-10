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
    $('#tab-button li#lc_l1_dig i.close').click(function () {
        $('#lc_l1_dig').fadeOut('fast');
        $('#logical_data_l1_dig').fadeOut('fast');

    });

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
  $.validator.setDefaults( {
      submitHandler: function () {
          alert( "submitted!" );
      }
  });

  $(".trace_file_form #trace_file_upload").validate( {
      rules: {
        trace_file: {
            required: true,
            extension: "txt|text"
        }
      },
      messages: {
        trace_file: {
            required: "Please Upload the file",
            extension: "Please provide a correct format"
        }
      },
      errorElement: "em",
      errorPlacement: function ( error, element ) {
          // Add the `help-block` class to the error element
            error.addClass( "help-block" );
            if ( element.prop( "type" ) === "checkbox" ) {
                error.insertAfter( element.parent( "label" ) );
            } else {
                error.insertAfter( element );
            }
      },
      highlight: function ( element, errorClass, validClass ) {
          $( element ).parents( ".col-sm-5" ).addClass( "has-error" ).removeClass( "has-success" );
          },
      unhighlight: function (element, errorClass, validClass) {
          $( element ).parents( ".col-sm-5" ).addClass( "has-success" ).removeClass( "has-error" );
      }
  });

});


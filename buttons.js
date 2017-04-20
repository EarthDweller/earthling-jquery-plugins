/**
 * Created by PhpStorm.
 *
 * @file
 *
 * Описание
 *
 * @author Timofey timofey@1september.ru/T-Soloveychik@ya.ru
 *
 * @date 2017-04-07 10:37:08
 *
 * @copyright Timofey - 1september 2017
 */

$.fn.showButton = function(showClass) {
	var $buttons = this;

	$buttons.each(function() {
		var $button = $(this);

		if (showClass)
			$button.addClass(showClass);

		if ($button.data("show-class"))
			$button.addClass($button.data("show-class"));

		if ($button.data("hide-class"))
			$button.removeClass($button.data("hide-class"));
	});

	return $buttons;
};

$.fn.hideButton = function(showClass) {
	var $buttons = this;

	$buttons.each(function() {
		var $button = $(this);

		if (showClass)
			$button.removeClass(showClass);

		if ($button.data("show-class"))
			$button.removeClass($button.data("show-class"));

		if ($button.data("hide-class"))
			$button.addClass($button.data("hide-class"));
	});

	return $buttons;
};

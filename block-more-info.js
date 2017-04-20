/**
 * Created by PhpStorm.
 *
 * @file block-more-info.js
 *
 * Добавление события отображения блока дополнительной информации
 *
 * @author Соловейчик Тимофей <timofey@1september.ru>/<T-Soloveychik@ya.ru>
 *
 * @date 2016-07-19 19:08
 */
function setBlockMoreInfo()
{
	var className = "block-more-info";

	$("." + className)
		.not(".with-event")
		.addClass("with-event")
		.on("click" ,function(event) {
			var $block = $(this);

			var $target = $(event.target);

			if (event.target != this)
				return true;

			var $shower;

			var timer = 750;
			if ($block.data("timer"))
				timer = $block.data("timer");

			var timing = 50;
			if ($block.data("onResizingTiming"))
				timing = $block.data("onResizingTiming");

			var previous = $block.prev();

			if (previous.hasClass(className + "-show") && previous.data("block") === "next")
				$shower = previous.trigger("click");

			var next = $block.next();

			if (next.hasClass(className + "-show") && next.data("block") === "prev")
				$shower = next.trigger("click");

			if ($block.data("onresizing"))
			{
				if ($block.data("onResizingTimer"))
					clearInterval($block.data("onResizingTimer"));

				$block.data("onResizingTimer" ,setInterval(function() {
					window[$block.data("onresizing")]();
				} ,timing));
			}

			$block.stop(true ,false);
			if ($block.hasClass(className + "-hidden"))
			{
				$block.height($block.find("div").height()).removeClass(className + "-hidden");
				$block.data("timeout" ,setTimeout(function() {
					$block.height("auto");
					if ($block.data("onResizingTimer"))
						clearInterval($block.data("onResizingTimer"));
				} ,timer));

				if ($shower)
				{
					$shower.data("html" ,$shower.html());
					html = "Свернуть описание";
					if ($shower.data("replace-html"))
						html = $shower.data("replace-html");
					$shower.html(html);
				}
			}
			else
			{
				$block.height($block.find("div").height());
				setTimeout(function() {
					$block.addClass(className + "-hidden").height(0);
				} ,5);

				if ($shower)
				{
					html = $shower.data("html");
					if ($shower.data("replace-html-hide"))
						html = $shower.data("replace-html-hide");
					$shower.html(html);
				}
			}

			if ($block.data("onResizingTimer"))
				setTimeout(function() {
					clearInterval($block.data("onResizingTimer"));
				} ,timer);

		});

	$("." + className + "-show")
		.not(".with-event")
		.addClass("with-event")
		.each(function() {
			var $shower = $(this);

			$shower
				.css("cursor" ,"pointer")
				.css("height" ,$shower.height())
				.on("click" ,function() {
					var $shower = $(this);

					var $block;
					if ($shower.data("block") == "prev")
						$block = $shower.prevAll("." + className).first();
					else
						$block = $shower.nextAll("." + className).first();

					if (!$block.length)
						return;

					$block.trigger("click");
				});
			}
		);
}

$.fn.blockMoreInfoShow = function() {
	var $block = $(this);

	if ($block.hasClass("block-more-info-hidden"))
		$block.trigger("click");

	return $block;
};

$.fn.blockMoreInfoHide = function() {
	var $block = this;

	if ($block.hasClass("block-more-info"))
		$block.trigger("click");

	return $block;
};

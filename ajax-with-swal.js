/**
 * @copyright 1september 2019
 */

$.fn.ajaxWithSwal = function(uriOrOptions ,data ,errorText ,onSuccess ,faElem) {
	var errors = [];

	var isSVG = false;
	var parent = null;
	var faSpinClassName = "-circle-o-notch";

	var options;

	if (typeof uriOrOptions == "object")
		options = uriOrOptions;
	else
		options = {
			uri : uriOrOptions
		};

	var ajaxHolder = $(this);
	if (options.ajaxHolder)
		ajaxHolder = options.ajaxHolder;

	if (options.url)
		options.uri = options.url;

	if (!options.uri)
		errors.push("Не указан аргумент «uri»!");

	if (!data && !options.data)
		errors.push("Не указан аргумент «data»!");

	if (data && !options.data)
		options.data = data;

	if (!(options.data instanceof Object))
		errors.push("Аргумент «data»! должен быть объектом! Указан " + typeof data);

	if (!options.errorTitle)
		options.errorTitle = "Ошибка";


	if (!errorText && !options.errorText)
		errorText  = "Не удалось отправить запрос на сервер!";

	if (!options.errorText)
		options.errorText = errorText;



	if (!onSuccess && !options.onSuccess)
		errors.push("Не указан аргумент «onSuccess»!");

	if (!(onSuccess instanceof Function) && !(options.onSuccess && options.onSuccess instanceof Function))
		errors.push("Аргумент «onSuccess» должен быть функцией! Передано: " + typeof onSuccess);

	if (!options.onSuccess)
		options.onSuccess = onSuccess;


	if (options.onError && !(options.onError instanceof Function))
		errors.push("Аргумент «onError» должен быть функцией! Передано: " + typeof options.onError);


	if (options.onComplete && !(options.onComplete instanceof Function))
		errors.push("Аргумент «onComplete» должен быть функцией! Передано: " + typeof options.onComplete);


	if (options.beforeSuccess && !(options.beforeSuccess instanceof Function))
		errors.push("Аргумент «beforeSuccess» должен быть функцией! Передано: " + typeof options.beforeSuccess);


	if (!faElem && options.faElem)
		faElem = options.faElem;

	// Если сам элемент хранения запроса и есть иконка FA:
	if (!faElem && ajaxHolder.hasClass("fa"))
		faElem = ajaxHolder;

	if (!faElem)
		return swal({
			  title             : "Запрос не отправлен!"
			, text              : "Произошла ошибка, напишите в службу поддержки!"
			, allowOutsideClick : true
		});

	// В fontawesome теперь элемент «i» заменяется на элемент «svg»:
	if (!faElem.length)
		faElem = this.find("svg:first");

	// Если fontawesome в span, который будет родителем:
	if ((faElem && faElem.prop("tagName") && faElem.prop("tagName").match(/svg/i)) || options.isSVG)
	{
		isSVG = true;
		faSpinClassName = "-circle-notch";
		// обернуть fontawesome – это SVG элемент:
		parent = $("<span></span>");
		faElem.after(parent);
		parent.append(faElem);
	}

	// В fontawesome теперь элемент «i» заменяется на элемент «svg»:
	if (!faElem.length)
		errors.push("Аргумент «faElem» не найден, ни  элемент «i», ни элемент «svg»!");

	if (errors.length)
		return swal({
					  title             : "Запрос не отправлен!"
					, text              : "Запрос не отправлен, так как были найдены ошибки: " + "\n" + errors.concat("\n")
					, allowOutsideClick : true
				});

	try
	{
		if (!options.data)
			options.data = ajaxHolder.serialize();

		var jqXHR = ajaxHolder.data("jqXHR");
		if (jqXHR && jqXHR.readyState == 1)
		{
			if (options.ignore)
			{
				if (jqXHR.readyState == 1)
					jqXHR.abort();
			}
			else
			{
				if (options.abort)
					return jqXHR.abort();

				swal({
						  title             : "Прервать отправку сообщения?"
						, text              : "Если ответ ещё не получен, то передача запроса будет прервана."
						, showCancelButton  : true
						, confirmButtonColor: "#FEAB2E"
						, confirmButtonText : "Да, прервать!"
						, cancelButtonText  : "Нет, ждать ответа!"
						, closeOnConfirm    : false
						, closeOnCancel     : true
						, allowOutsideClick : true
					}
					,function ( isConfirm ) {
						if (isConfirm) {
							if (+jqXHR.readyState != 4) {
								jqXHR.abort();
								swal({
									  title            : "Передача остановлена!"
									, text             : "Передача прервана на Вашем устройстве."
									, allowOutsideClick: true
								});
							}
							else {
								swal({
									  title            : "Данные уже переданы!"
									, text             : "Не удалось прервать запрос, так как данные уже отправлены."
									, allowOutsideClick: true
								});
							}

							return false;
						}
					}
				);
			}

			return false;
		}

		$.ajax({
			  type       : "POST"
			, dataType   : "json"
			, context    : faElem
			, data       : options.data
			, cache      : false
			, processData: (options.data.constructor != FormData)
			, contentType: (options.data.constructor != FormData ? "application/x-www-form-urlencoded; charset=UTF-8" : false)
			, timeout    : (options.timeout ? options.timeout : (50 * 1000)) // 50 секунд
			, url        : options.uri
			, beforeSend : function ( jqXHR ) {
				ajaxHolder.data("jqXHR" ,jqXHR);

				var elemToSpin = faElem;
				if (!isSVG)
					faElem.data("fa" ,faElem.attr("class"));
				else
				{
					elemToSpin = faElem.clone();
					faElem.replaceWith(elemToSpin);
				}

				elemToSpin.attr("class",elemToSpin.attr("class").replace(/(fa[srl]?\s*fa)-[^\s]+/,"$1" + faSpinClassName));
				elemToSpin.addClass("fa-fw");
				elemToSpin.addClass("fa-spin");

				if (options.beforeSend)
					options.beforeSend();
			}

			, complete: function () {
				ajaxHolder.data("jqXHR" ,null);

				if (!isSVG)
					faElem.attr("class",faElem.data("fa"));
				else
					parent.find("svg").replaceWith(faElem);

				if (options.onComplete)
					options.onComplete();
			}

			, success: function ( response ) {
				try {
					if (options.beforeSuccess)
						options.beforeSuccess(response);

					if (response.success) {
						options.onSuccess(response);
					}
					else {

						if (options.onResponseWithError)
							options.onResponseWithError(response);

						else
						{
							console.log('response');
							console.log(response);
							swal({
								  title            : response.hasOwnProperty("errorTitle") ? response.errorTitle : options.errorTitle
								, text             : response.error
								, type             : typeof response.swalType === "string" ? response.swalType : "error"
								, allowOutsideClick: true
								, html             : response.swalWithHtml ? true : false
							});
						}
					}
				}
				catch (e) {
					console.log(e);
					swal({
						  title            : options.errorTitle
						, text             : options.errorText
						, type             : "error"
						, allowOutsideClick: true
					});
				}
				finally {
				}
			}

			, error: function (XMLHttpRequest ,textStatus )
			{
				var errorText  = "Не удалось обработать ответ от сервера!";

				var withOutMessage = true;

				try {
					switch (textStatus)
					{
						case "abort":
							withOutMessage = true;
							options.errorTitle = "Отправка остановлена";
							errorText  = "Отправка запроса была остановлена!";
							break;

						case "timeout":
							withOutMessage = true;
							options.errorTitle = "Сервер не отвечает";
							errorText  = "Возможно у вас проблемы с интернетом или сервер перегружен!";
							break;

						case "parsererror":
							withOutMessage = false;
							options.errorTitle = "Неправильный формат данных";
							errorText  = "Данные, полученные от сервера, имеют неправильный формат и не могут быть обработаны!";
							break;

						case "error":
						default:
							options.errorTitle = "Ошибка";
							switch (+XMLHttpRequest.status)
							{
								case 401:
									withOutMessage = true;
									errorText = "Нужно авторизоваться";
									break;

								case 403:
									withOutMessage = true;
									errorText = "Доступ к запрашиваемой странице закрыт!";
									break;

								case 404:
									withOutMessage = false;
									errorText = "При отправке запроса произошла ошибка!";
									if (options.with404)
										errorText = "Запрашиваемый раздел не найден!";
									break;

								case 500:
									withOutMessage = false;
									errorText = "Произошла ошибка при обработке запроса, данные об ошибке отправлены для проверки.";
									break;

								default:
									withOutMessage = false;
									errorText = $.parseJSON(XMLHttpRequest.responseText);
							}
					}
				}
				catch (e) {
					console.log(e);

					options.errorTitle = "Ошибка";
					errorText  = "Не удалось обработать ответ от сервера!";
				}
				finally {
					faElem.data("jqXHR" ,null);

					if (!isSVG)
						faElem.attr("class",faElem.data("fa"));
					else
						parent.find("svg").replaceWith(faElem);

					if (textStatus === "abort" && (values.abort || values.ignore))
					{
						if (options.onAbort)
							options.onAbort();
					}
					else
					{
						if (window.sendError)
						{
							var error = new Error();
							error.data = {ajax: XMLHttpRequest};
							window.sendError(error ,errorText ,withOutMessage);
						}

						swal({
							  title            : options.errorTitle
							, text             : errorText
							, type             : "error"
							, allowOutsideClick: true
						});

						if (options.onError)
							options.onError();
					}

				}
			}
		});
	}
	catch (e) {
		console.log(e);
		swal({
			  title            : "Ошибка"
			, text             : options.errorText
			, type             : "error"
			, allowOutsideClick: true
		});
	}
};

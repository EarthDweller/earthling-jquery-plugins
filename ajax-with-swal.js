/**
 * @copyright 1september 2019
 */

$.fn.ajaxWithSwal = function(uriOrData ,data ,errorText ,onSuccess ,faElem) {
	var errors = [];

	var values;

	if (typeof uriOrData == "object")
		values = uriOrData;
	else
		values = {
			uri : uriOrData
		};

	var ajaxHolder = $(this);
	if (values.ajaxHolder)
		ajaxHolder = values.ajaxHolder;

	if (values.url)
		values.uri = values.url;

	if (!values.uri)
		errors.push("Не указан аргумент «uri»!");

	if (!data && !values.data)
		errors.push("Не указан аргумент «data»!");

	if (data && !values.data)
		values.data = data;

	if (!(values.data instanceof Object))
		errors.push("Аргумент «data»! должен быть объектом! Указан " + typeof data);

	if (!values.errorTitle)
		values.errorTitle = "Ошибка";


	if (!errorText && !values.errorText)
		errorText  = "Не удалось отправить запрос на сервер!";

	if (!values.errorText)
		values.errorText = errorText;



	if (!onSuccess && !values.onSuccess)
		errors.push("Не указан аргумент «onSuccess»!");

	if (!(onSuccess instanceof Function) && !(values.onSuccess && values.onSuccess instanceof Function))
		errors.push("Аргумент «onSuccess» должен быть функцией! Передано: " + typeof onSuccess);

	if (!values.onSuccess)
		values.onSuccess = onSuccess;


	if (values.onError && !(values.onError instanceof Function))
		errors.push("Аргумент «onError» должен быть функцией! Передано: " + typeof values.onError);


	if (values.onComplete && !(values.onComplete instanceof Function))
		errors.push("Аргумент «onComplete» должен быть функцией! Передано: " + typeof values.onComplete);


	if (values.beforeSuccess && !(values.beforeSuccess instanceof Function))
		errors.push("Аргумент «beforeSuccess» должен быть функцией! Передано: " + typeof values.beforeSuccess);


	if (!faElem && values.faElem)
		faElem = values.faElem;

	// В fontawesome теперь элемент «i» заменяется на элемент «svg»:
	if (!faElem.length)
		faElem = this.find("svg");

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
		if (!faElem)
			faElem = ajaxHolder;

		if (!values.data)
			values.data = ajaxHolder.serialize();

		var jqXHR = ajaxHolder.data("jqXHR");
		if (jqXHR && jqXHR.readyState == 1)
		{
			if (values.ignore)
			{
				if (jqXHR.readyState == 1)
					jqXHR.abort();
			}
			else
			{
				if (values.abort)
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
			, data       : values.data
			, cache      : false
			, processData: (values.data.constructor != FormData)
			, contentType: (values.data.constructor != FormData ? "application/x-www-form-urlencoded; charset=UTF-8" : false)
			, timeout    : (values.timeout ? values.timeout : (50 * 1000)) // 50 секунд
			, url        : values.uri
			, beforeSend : function ( jqXHR ) {
				ajaxHolder.data("jqXHR" ,jqXHR);

				faElem.data("fa" ,faElem.attr("class"));

				faElem.attr("class",faElem.attr("class").replace(/(fa[srl]? fa)-[^\s]+/,"$1-circle-o-notch"));
				faElem.addClass("fa-spin");
				faElem.addClass("fa-fw");

				if (values.beforeSend)
					values.beforeSend();
			}
			, complete   : function () {
				ajaxHolder.data("jqXHR" ,null);

				faElem.attr("class",faElem.data("fa"));

				if (values.onComplete)
					values.onComplete();
			}
			, success    : function ( response ) {
				try {
					if (values.beforeSuccess)
						values.beforeSuccess(response);

					if (response.success) {
						values.onSuccess(response);
					}
					else {

						if (values.onResponseWithError)
							values.onResponseWithError(response);

						else
						{
							console.log(response);
							swal({
								  title            : response.hasOwnProperty("errorTitle") ? response.errorTitle : values.errorTitle
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
						  title            : values.errorTitle
						, text             : values.errorText
						, type             : "error"
						, allowOutsideClick: true
					});
				}
				finally {
				}
			}
			, error      : function (XMLHttpRequest ,textStatus )
			{
				var errorText  = "Не удалось обработать ответ от сервера!";

				var withOutMessage = true;

				try {
					switch (textStatus)
					{
						case "abort":
							withOutMessage = true;
							values.errorTitle = "Отправка остановлена";
							errorText  = "Отправка запроса была остановлена!";
							break;

						case "timeout":
							withOutMessage = true;
							values.errorTitle = "Сервер не отвечает";
							errorText  = "Возможно у вас проблемы с интернетом или сервер перегружен!";
							break;

						case "parsererror":
							withOutMessage = false;
							values.errorTitle = "Неправильный формат данных";
							errorText  = "Данные, полученные от сервера, имеют неправильный формат и не могут быть обработаны!";
							break;

						case "error":
						default:
							values.errorTitle = "Ошибка";
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
									if (values.with404)
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

					values.errorTitle = "Ошибка";
					errorText  = "Не удалось обработать ответ от сервера!";
				}
				finally {
					faElem.data("jqXHR" ,null);

					faElem.attr("class",faElem.data("fa"));

					if (textStatus == "abort" && (values.abort || values.ignore))
					{
						if (values.onAbort)
							values.onAbort();
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
							  title            : values.errorTitle
							, text             : errorText
							, type             : "error"
							, allowOutsideClick: true
						});

						if (values.onError)
							values.onError();
					}

				}
			}
		});
	}
	catch (e) {
		console.log(e);
		swal({
			  title            : "Ошибка"
			, text             : values.errorText
			, type             : "error"
			, allowOutsideClick: true
		});
	}
};

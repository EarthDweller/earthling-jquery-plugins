/**
 * @copyright 1september 2016
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


	if (!faElem && values.faElem)
		faElem = values.faElem;


	if (errors.length)
		return swal({
					  title             : "Запрос не отправлен!"
					, text              : "Запрос не отправлен, так как были найдены ошибки: " + "\n" + errors.concat("\n")
					, allowOutsideClick : true
				});

	try
	{
		var jElem = $(this);

		if (!faElem)
			faElem = jElem;

		if (!values.data)
			values.data = jElem.serialize();

		var jqXHR = jElem.data("jqXHR");
		if (jqXHR && jqXHR.readyState == 1)
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
				jElem.data("jqXHR" ,jqXHR);

				faElem.data("fa" ,faElem.attr("class"));

				faElem.attr("class",faElem.attr("class").replace(/(fa fa)-[^\s]+/,"$1-circle-o-notch"));
				faElem.addClass("fa-spin");
			}
			, complete   : function () {
				jElem.data("jqXHR" ,null);

				faElem.attr("class",faElem.data("fa"));
			}
			, success    : function ( data ) {
				try {
					if (data.success) {
						values.onSuccess(data);
					}
					else {
						swal({
							  title            : values.errorTitle
							, text             : data.error
							, type             : "error"
							, allowOutsideClick: true
							, html             : data.swalWithHtml ? true : false
						});
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
									withOutMessage = true;
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

					if (window.sendError)
					{
						var error = new Error();
						error.data = {ajax: XMLHttpRequest};
						window.sendError(error ,errorText ,withOutMessage);
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

					if (textStatus == "abort" && values.abort)
					{
						if (values.onAbort)
							values.onAbort();
					}
					else
					{
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

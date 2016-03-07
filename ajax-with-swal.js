/**
 * @copyright 1september 2016
 */

$.fn.ajaxWithSwal = function(uri ,data ,errorText ,onSuccess ,faElem) {
	var errorTitle = "Ошибка";

	var errors = [];

	if (!uri)
		errors.push("Не указан аргумент «uri»!");

	if (!data)
		errors.push("Не указан аргумент «data»!");

	if (!(data instanceof Object))
		errors.push("Аргумент «data»! должен быть объектом! Указан " + typeof data);

	if (!errorText)
		errorText  = "Не удалось обработать отправить запрос на сервер";

	if (!onSuccess)
		errors.push("Не указан аргумент «onSuccess»!");

	if (!(onSuccess instanceof Function))
		errors.push("Аргумент «onSuccess»! должен быть функцией! Указан " + typeof onSuccess);

	if (errors.length)
		return swal({
					 title             : "Запрос не отправлен!"
					,text              : "Запрос не отправлен, так как были найдены ошибки: " + "\n" + errors.concat("\n")
					,allowOutsideClick : true
				});

	try
	{
		var jElem = $(this);

		if (!faElem)
			faElem = jElem;

		if (!data)
			data = jElem.serialize();

		var jqXHR = faElem.data("jqXHR");
		if (jqXHR && jqXHR.readyState == 1)
		{
			swal({
					 title             : "Прервать отправку сообщения?"
					,text              : "Если ответ ещё не получен, то передача запроса будет прервана."
					,showCancelButton  : true
					,confirmButtonColor: "#FEAB2E"
					,confirmButtonText : "Да, прервать!"
					,cancelButtonText  : "Нет, ждать ответа!"
					,closeOnConfirm    : false
					,closeOnCancel     : true
					,allowOutsideClick : true
				}
				,function ( isConfirm ) {
					if (isConfirm) {
						if (+jqXHR.readyState != 4) {
							jqXHR.abort();
							swal({
								 title            : "Передача остановлена!"
								,text             : "Передача прервана на Вашем устройстве."
								,allowOutsideClick: true
							});
						}
						else {
							swal({
								 title            : "Данные уже переданы!"
								,text             : "Не удалось прервать запрос, так как данные уже отправлены."
								,allowOutsideClick: true
							});
						}

						return false;
					}
				}
			);

			return false;
		}
		else {
			$.ajax({
				 type       : "POST"
				,dataType   : "json"
				,context    : faElem
				,data       : data
				,cache      : false
				,processData: (data.constructor != FormData)
				,contentType: (data.constructor != FormData ? "application/x-www-form-urlencoded; charset=UTF-8" : false)
				,timeout    : 50 * 1000 // 50 секунд
				,url        : uri
				,beforeSend : function ( jqXHR ) {
					faElem.data("jqXHR" ,jqXHR);

					faElem.data("fa" ,faElem.attr("class"));

					faElem.attr("class",faElem.attr("class").replace(/(fa fa)-[^\s]+/,"$1-circle-o-notch"));
					faElem.addClass("fa-spin");
				}
				,complete   : function () {
					faElem.data("jqXHR" ,null);

					faElem.attr("class",faElem.data("fa"));
				}
				,success    : function ( data ) {
					try {
						if (data.success) {
							onSuccess(data);
						}
						else {
							swal({
								 title            : errorTitle
								,text             : data.error
								,type             : "error"
								,allowOutsideClick: true
							});
						}
					}
					catch ($e) {
						swal({
							 title            : errorTitle
							,text             : errorText + "\n" + $e
							,type             : "error"
							,allowOutsideClick: true
						});
					}
					finally {
					}
				}
				,error      : function (XMLHttpRequest ,textStatus)
				{
					var errorText  = "Не удалось обработать ответ от сервера!";

					try {
						switch (textStatus)
						{
							case "abort":
								errorTitle = "Отправка остановлена";
								errorText  = "Отправка запроса была остановлена!";
								break;

							case "timeout":
								errorTitle = "Сервер не отвечает";
								errorText  = "Возможно у вас проблемы с интернетом или сервер перегружен!";
								break;

							case "parsererror":
								errorTitle = "Неправильный формат данных";
								errorText  = "Данные, полученные от сервера, имеют неправильный формат и не могут быть обработаны!";
								break;

							case "error":
							default:
								errorTitle = "Ошибка";
								errorText  = $.parseJSON(XMLHttpRequest.responseText);
						}
					}
					catch ($e) {
						errorTitle = "Ошибка";
						errorText  = "Не удалось обработать ответ от сервера!" + "\n" + $e;
					}
					finally {
						faElem.data("jqXHR" ,null);

						faElem.attr("class",faElem.data("fa"));

						console.log('textStatus');
						console.log(textStatus);
						console.log('XMLHttpRequest');
						console.log(XMLHttpRequest);

						swal({
							 title            : errorTitle
							,text             : errorText
							,type             : "error"
							,allowOutsideClick: true
						});
					}
				}
			});
		}
	}
	catch ($e) {
		swal({
			 title            : "Ошибка"
			,text             : errorText + "\n" + $e
			,type             : "error"
			,allowOutsideClick: true
		});
	}
};

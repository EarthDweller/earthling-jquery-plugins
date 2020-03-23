/**
 * @copyright 1september 2019
 */

/**
 * @param {Node}          options.$ajaxHolder
 * @param {Node}          [options.ajaxHolder] @deprecated
 *
 * @param {string}        options.url
 * @param {Object}        options.data
 *
 * @param {string}        [options.uri] @deprecated
 * @param {string}        [options.errorTitle]
 * @param {string}        [options.errorText]
 * @param {string}        [options.text]
 *
 * @param {Number}        [options.timeout]
 *
 * @param {Node}          [options.$faElem]
 * @param {Node}          [options.faElem] @deprecated
 *
 * @param {boolean}       [options.ignore]
 * @param {boolean}       [options.abort]
 * @param {boolean}       [options.with404]
 *
 * @param {null|Function} [options.beforeSend]
 * @param {null|Function} [options.beforeSuccess]
 * @param {null|Function} [options.onSuccess]
 * @param {null|Function} [options.onComplete]
 * @param {null|Function} [options.onResponseWithError]
 * @param {null|Function} [options.onError]
 * @param {null|Function} [options.onAbort]
 */
$.fn.ajaxHelper = function(options) {
    let errors = [];

    let isSVG = false;
    let parent = null;
    let faSpinClassName = "-circle-o-notch";

    let $ajaxHolder = $(this);
    if (options.$ajaxHolder)
        $ajaxHolder = options.$ajaxHolder || options.ajaxHolder;

    if (options.url)
        options.uri = options.url;

    if (!options.uri)
        errors.push("Не указан аргумент «uri»!");

    if (!(options.data instanceof Object))
        errors.push("Аргумент «data»! должен быть объектом! Указан " + typeof data);

    if (!options.errorTitle)
        options.errorTitle = "Ошибка";

    if (options.text)
        options.body = options.text;

    if (!options.errorText)
        options.errorText = "Не удалось отправить запрос на сервер!";

    if (!options.onSuccess)
        errors.push("Не указан аргумент «onSuccess»!");

    if (!(options.onSuccess && options.onSuccess instanceof Function))
        errors.push("Аргумент «onSuccess» должен быть функцией! Передано: " + (typeof options.onSuccess));

    if (options.onError && !(options.onError instanceof Function))
        errors.push("Аргумент «onError» должен быть функцией! Передано: " + (typeof options.onError));

    if (options.onComplete && !(options.onComplete instanceof Function))
        errors.push("Аргумент «onComplete» должен быть функцией! Передано: " + (typeof options.onComplete));

    if (options.beforeSuccess && !(options.beforeSuccess instanceof Function))
        errors.push("Аргумент «beforeSuccess» должен быть функцией! Передано: " + (typeof options.beforeSuccess));

    let $faElem = options.faElem;

    if (!$faElem)
        $faElem = options.$faElem;

    if (!$faElem)
        $faElem = $ajaxHolder;

    // В fontawesome теперь элемент «i» заменяется на элемент «svg»:
    if (!$faElem.length)
        $faElem = this.find("svg:first");

    // Если fontawesome в span, который будет родителем:
    if ($faElem && $faElem.prop("tagName").match(/svg/i) || isSVG)
    {
        isSVG = true;
        faSpinClassName = "-circle-notch";
        // обернуть fontawesome – это SVG элемент:
        parent = $("<span></span>");
        $faElem.after(parent);
        parent.append($faElem);
    }

    // В fontawesome теперь элемент «i» заменяется на элемент «svg»:
    if (!$faElem.length)
        errors.push("Аргумент «$faElem» не найден, ни  элемент «i», ни элемент «svg»!");

    if (errors.length)
    {
        modalConfirm.ask({
                  title    : "Запрос не отправлен!"
                , body     : "Запрос не отправлен, так как были найдены ошибки: " + "\n" + errors.concat("\n")
                , refuseBtn: null
                , confirmBtn: "Закрыть"
            });

        return
    }

    try
    {
        if (!options.data)
            options.data = $ajaxHolder.serialize();

        let jqXHR = $ajaxHolder.data("jqXHR");
        if (jqXHR && jqXHR.readyState === 1)
        {
            if (options.ignore)
            {
                if (jqXHR.readyState === 1)
                    jqXHR.abort();
            }
            else
            {
                if (options.abort)
                    return jqXHR.abort();

                modalConfirm.ask({
                          title     : "Прервать отправку сообщения?"
                        , body      : "Если ответ ещё не получен, то передача запроса будет прервана."
                        , confirmBtn: "Да, прервать!"
                        , refuseBtn : "Нет, ждать ответа!"
                    }
                    ,() => {
                        if (+jqXHR.readyState !== 4) {
                            jqXHR.abort();
                            modalConfirm.ask({
                                  title    : "Передача остановлена!"
                                , body     : "Передача прервана на Вашем устройстве."
                                , refuseBtn: null
                                , confirmBtn: "Закрыть"
                            });
                        }
                        else
                            modalConfirm.ask({
                                  title    : "Данные уже переданы!"
                                , body     : "Не удалось прервать запрос, так как данные уже отправлены."
                                , refuseBtn: null
                                , confirmBtn: "Закрыть"
                            });
                    }
                    ,() => {}
                );
            }

            return false;
        }

        $.ajax({
              type       : "POST"
            , dataType   : "json"
            , context    : $faElem
            , data       : options.data
            , cache      : false
            , processData: (options.data.constructor !== FormData)
            , contentType: (options.data.constructor !== FormData ? "application/x-www-form-urlencoded; charset=UTF-8" : false)
            , timeout    : (options.timeout ? options.timeout : (50 * 1000)) // 50 секунд
            , url        : options.uri
            , beforeSend : function ( jqXHR ) {
                $ajaxHolder.data("jqXHR" ,jqXHR);

                let $elemToSpin = $faElem;
                if (!isSVG)
                    $faElem.data("fa" ,$faElem.attr("class"));
                else
                {
                    $elemToSpin = $faElem.clone();
                    $faElem.replaceWith($elemToSpin);
                }

                $elemToSpin.attr("class",$elemToSpin.attr("class").replace(/(fa[srl]?\s*fa)-[^\s]+/,"$1" + faSpinClassName));
                $elemToSpin.addClass("fa-fw");
                $elemToSpin.addClass("fa-spin");

                if (options.beforeSend)
                    options.beforeSend();
            }

            , complete: function () {
                $ajaxHolder.data("jqXHR" ,null);

                if (!isSVG)
                    $faElem.attr("class",$faElem.data("fa"));
                else
                    parent.find("svg").replaceWith($faElem);

                if (options.onComplete)
                    options.onComplete();
            }

            , success: function ( response ) {
                try
                {
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
                            console.log(response);
                            modalConfirm.ask({
                                  title    : response.hasOwnProperty("errorTitle") ? response.errorTitle : options.errorTitle
                                , body     : response.body ?? "При запросе произошла ошибка! В ответе от сервера не указано, что ответ передан полностью!"
                                , refuseBtn: null
                                , confirmBtn: "Закрыть"
                            });
                        }
                    }
                }
                catch (e)
                {
                    console.log(e);
                    modalConfirm.ask({
                          title    : options.errorTitle
                        , body     : options.errorText ? options.errorText : "Произошла ошибка при обработке ответа сервера!"
                        , refuseBtn: null
                        , confirmBtn: "Закрыть"
                    });
                }
                finally {}
            }

            , error: function (XMLHttpRequest ,textStatus )
            {
                let errorText  = "Не удалось обработать ответ от сервера!";

                let withOutMessage = true;

                try
                {
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
                                    errorText = "Произошла ошибка при обработке запроса.";
                                    break;

                                default:
                                    withOutMessage = false;
                                    errorText = $.parseJSON(XMLHttpRequest.responseText);
                            }
                    }
                }
                catch (e)
                {
                    console.log(e);

                    options.errorTitle = "Ошибка";
                    errorText  = "Не удалось обработать ответ от сервера!";
                }
                finally
                {
                    $faElem.data("jqXHR" ,null);

                    if (!isSVG)
                        $faElem.attr("class",$faElem.data("fa"));
                    else
                        parent.find("svg").replaceWith($faElem);

                    if (textStatus === "abort" && (options.abort || options.ignore))
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

                        modalConfirm.ask({
                              title    : options.errorTitle
                            , body     : errorText
                            , refuseBtn: null
                            , confirmBtn: "Закрыть"
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
        modalConfirm.ask({
              title    : "Ошибка"
            , body     : options.errorText
            , refuseBtn: null
            , confirmBtn: "Закрыть"
        });
    }
};



//body tag in window.html
//<script src="custom.js"></script>

window.onload = function (event) {
	setTimeout(function () {
		if (document.getElementsByClassName("vivaldi") && document.getElementsByClassName("vivaldi").length > 0)
			document.getElementsByClassName("vivaldi")[0].title = "Lực Nguyễn";

		clearSearchInput();

		if (document.getElementById("urlFieldInput")) {
			document.getElementById("urlFieldInput").onchange = function () {
				setTimeout(function () {
					var currentUrl = document.getElementById("urlFieldInput").value;

					if (currentUrl.includes("StartPageChrome2")) {
						clearSearchInput();

						return;
					}


					if (currentUrl.includes("localhost") || currentUrl.includes("127.0.0.1")) {
						setTimeout(function () {
							localhost();
						}, 200);

						return;
					}
						


					var port = getPort(currentUrl);
					if (port != "") {
						setTimeout(function () {
							showPort();
						}, 200);

						return;
					}
						

				}, 100)
			};
		}
	}, 1000)
};

showPort = function () {
	var currentUrl = document.getElementById("urlFieldInput").value;
	var port = getPort(currentUrl);

	if (document.querySelectorAll("#tabs-container .tab.active").length > 0) {
		var tabActive = document.querySelectorAll("#tabs-container .tab.active")[0];
		var title = tabActive.title;

		tabActive.title = port + " ● " + title;
		tabActive.getElementsByClassName("title")[0].innerHTML = port + "<span class='port-title'>-</span>" + title;
	}
}

localhost = function () {
	if (document.querySelectorAll("#tabs-container .tab.active").length > 0) {
		var tabActive = document.querySelectorAll("#tabs-container .tab.active")[0];
		var parent = tabActive.parentElement;
		parent.classList.add("localhost");

		var title = tabActive.title;

		tabActive.title = "Local ● " + title;
		tabActive.getElementsByClassName("title")[0].innerHTML = "local" + "<span class='port-title'>-</span>" + title;
	}
}

function getPort(url) {
	url = url.match(/^(([a-z]+:)?(\/\/)?[^\/]+).*$/)[1] || url;

	var parts = url.split(':'),
		port = parseInt(parts[parts.length - 1], 10);

	if (parts[0] === 'http' && (isNaN(port) || parts.length < 3))
		return "";
	
	if (parts[0] === 'https' && (isNaN(port) || parts.length < 3))
		return "";
	
	if (parts.length === 1 || isNaN(port))
		return "";

	return port;
}

clearSearchInput = function () {
	if (document.getElementById("urlFieldInput")) {
		document.getElementById("urlFieldInput").value = "";

		setTimeout(function () {
			document.getElementById("urlFieldInput").focus();
		}, 100);
	}
}


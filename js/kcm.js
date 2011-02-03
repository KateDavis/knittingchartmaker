var kcm = window.kcm || {};

kcm.main_grid = null;
window.onload = function() {
	kcm.main_grid = new kcm.KnittingChartMaker(
		"kcm_canvas",
		"kcm_chart_options"
	);
};
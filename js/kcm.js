var kcm = window.kcm || {};

kcm.main_grid = null;
window.onload = function() {
    kcm.main_grid = new kcm.KnittingChartMaker(
        "kcm_canvas",
        "kcm_chart_width",
        "kcm_chart_height",
        "kcm_chart_resize",
        "kcm_chart_stitch",
        "kcm_chart_stitch_size",
        "kcm_chart_yarn",
        "kcm_chart_yarn_colour",
        "kcm_chart_save",
        "kcm_chart_load",
        "kcm_chart_img_png",
        "kcm_chart_img_svg"
    );
};

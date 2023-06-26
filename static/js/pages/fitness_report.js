$(document).ready(function(){

    $(".DownloadReport").click(function(e) {
        // getPDF();
        $(".canvas_div_pdf").printThis({
            debug: false, // show the iframe for debugging
            importCSS: true, // import parent page css
            importStyle: true, // import style tags
            printContainer: true, // print outer container/$.selector
            loadCSS: "", // path to additional css file - use an array [] for multiple
            pageTitle: "", // add title to print page
            removeInline: false,
        });
    });
})
$(document).ready(function()
{

    var PatientData = $("#PatientData").data("val");
   
    var PatientScanData = $("#PatientScanData").data("val");


    $(".testing_Date").text(moment(PatientData[0].test_date).format("DD MMM, YYYY"));
    $(".testing_id").text("#"+PatientData[0].id);
    $(".patient_ID").text(PatientData[0].patient_id);
    $(".patient_Name").text(PatientData[0].patient_name);
    $(".patient_Age").text(PatientData[0].patient_age);
    $(".patient_Gender").text(PatientData[0].patient_gender);
    $(".patient_Doctor").text(PatientData[0].doctor_name);




    var ScanReport = ''

    if (PatientScanData.length != 0) {

      $.each(PatientScanData, function (i, Obj) {
        if (Obj.scan_value != ''){

          ScanReport = "<tr>\
                            <td>" +Obj.scan_name+ " </td>\
                            <td style='white-space: pre;'>" +Obj.scan_value+ "<br></td>\
                        </tr>"
            $(".ReportDetails").append(ScanReport);
        }
      });

    }
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

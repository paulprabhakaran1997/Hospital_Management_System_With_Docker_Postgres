$(document).ready(function()
{

    var PatientData = $("#PatientData").data("val");
   
    var PatientXrayData = $("#PatientXrayData").data("val");
    var XrayListData = $("#Xray-List-Data").data("val");


    $(".testing_Date").text(moment(PatientData[0].test_date).format("DD MMM, YYYY"));
    $(".testing_id").text("#"+PatientData[0].id);
    $(".patient_ID").text(PatientData[0].patient_id);
    $(".patient_Name").text(PatientData[0].patient_name);
    $(".patient_Age").text(PatientData[0].patient_age);
    $(".patient_Gender").text(PatientData[0].patient_gender);
    $(".patient_Doctor").text(PatientData[0].doctor_name);

    if (PatientXrayData.length != 0) {
      var TotalAmount = 0;
      $.each(PatientXrayData, function (i, obj) {
        
        var TestAmountFilter = XrayListData.filter(function (Obj) {
          return Obj.id == obj.xray_id;
        }); 
        TotalAmount += parseFloat(TestAmountFilter[0].amount);
        var ReportAppend = '<tr class="invoice_doctor_fees">\
                                <td>'+ obj.xray_name +'</td>\
                                <td id="invoice_doctor_fees" style="text-align:right;">'+parseFloat(TestAmountFilter[0].amount).toFixed(2)+'</td>\
                            </tr>';

        $(".Xray-Test-Details").append(ReportAppend);
      });

      $(".Xray-Payment-Total").text("₹ "+parseFloat(TotalAmount).toFixed(2));

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

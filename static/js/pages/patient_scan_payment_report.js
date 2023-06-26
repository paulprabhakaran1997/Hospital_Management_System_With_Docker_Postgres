$(document).ready(function()
{
    var scan_details = $("#scan_details").data("val");
   
    var PatientData = $("#patient_data").data("val");

    console.log(PatientData)
    console.log(scan_details)
   
        $("#invoice_AppointementID").text("#"+PatientData[0].appoint_id);
        $("#invoice_PatientName").text(PatientData[0].patient_name);
        $("#invoice_PatientId").text(PatientData[0].patient_id);
        $("#invoice_PatientAge").text(PatientData[0].patient_age);
        $("#invoice_PatientGender").text(PatientData[0].patient_gender);
        $("#invoice_Payment_Paid").text('₹  '+(parseInt(PatientData[0].total) - parseInt(PatientData[0].balance) - parseInt(PatientData[0].discount)));
        $("#invoice_Payment_Balance").text('₹  '+PatientData[0].balance);
        $("#invoice_Payment_Total").text('₹  '+(parseInt(PatientData[0].total) - parseInt(PatientData[0].discount)));

        parseInt(PatientData[0].cash) == 0 ? $('.Invoice_Cash').hide() : $('#Invoice_Cash').text('₹  '+PatientData[0].cash)
        parseInt(PatientData[0].card) == 0 ? $('.Invoice_Card').hide() : $('#Invoice_Card').text('₹  '+PatientData[0].card)
        parseInt(PatientData[0].upi) == 0 ? $('.Invoice_UPI').hide() : $('#Invoice_UPI').text('₹  '+PatientData[0].upi)
        parseInt(PatientData[0].discount) == 0 ? $('.invoice_Payment_Discount').hide() : $('#invoice_Payment_Discount').text('₹  '+PatientData[0].discount)


        if(PatientData[0].patient_type == "Out Patient"){
          $('.invoice_AppointementID').text('OP ID - ' + PatientData[0].appoint_id)
        }
        if(PatientData[0].patient_type == "In Patient"){
          $('.invoice_AppointementID').text('IP ID - ' + PatientData[0].appoint_id)
        }




        if (scan_details.length != 0) {


          scan_details.map(function(obj) {
            console.log(obj.scan_name)
            var AppendText = '<tr>\
                                <td>'+obj.scan_name+'</td>\
                                <td class="text-end">'+obj.scan_amount+'</td>\
                            </tr>';
                    $(".Invoice_Section").append(AppendText);

          })



        }
    
        $(".DownloadReport").click(function(e) {
            // getPDF();
            $(".Payment_canvas_div_pdf").printThis({
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
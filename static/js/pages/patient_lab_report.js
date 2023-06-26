$(document).ready(function()
{
    var PatientReportData = $("#PatientReportData").data("val");
   
    var PatientData = $("#PatientData").data("val");
   
        $(".testing_Date").text(moment(PatientData[0].test_date).format("DD MMM, YYYY"));
        $(".testing_id").text("#"+PatientData[0].id);
        $(".patient_Name").text(PatientData[0].patient_name);
        $(".patient_ID").text(PatientData[0].patient_id);
        $(".patient_Age").text(PatientData[0].patient_age);
        $(".patient_Gender").text(PatientData[0].patient_gender);
        $(".patient_Doctor").text(PatientData[0].doctor_name);

        if (PatientReportData.length != 0) {

          var UniqueNames = $.unique(
            PatientReportData.map(function (obj) {
              return obj.group_name;
            })
          );
    
          $.each(UniqueNames, function (i, Group_item) {

            var FilterTest = PatientReportData.filter(function (obj) {
              return obj.group_name == Group_item;
            });

            var testname = '';
            var Section = '';
            console.log(FilterTest)
            var TestReport = ''


            $.each(FilterTest, function (i, Obj) {
              if (Obj.testvalue != ""){
                  testname += "<tr><td>" + Obj.test_name + " </td>  \
                              <td>" + Obj.testvalue + " " + Obj.testunit + "</td> \
                              <td style='white-space: pre;'>"+ Obj.normal_range + "</td></tr>";
                  Section = Obj.category
                  TestReport = "<tr><td class='text-center GroupName' colspan='3'> " + Group_item+" - "+Section+"</td></tr>" + testname + "";
              }
            });
    
    
            $(".ReportDetails").append(TestReport);

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
function confirmDelete() {
  return confirm("Are you sure you want to delete this post?");
}

$(document).ready(function () {
  $(".devButton").click(function (e) {
    e.preventDefault(); // prevent default if it is still in dev

    // create popup if doesn't exist
    if ($("#devPopup").length === 0) {
      $("body").append(
        '<div id="devPopup" style="display: none; position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%); background-color: white; padding: 20px; border: 1px solid #ddd; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.5); z-index: 1000;">It is still in development</div>'
      );
    }

    // Show and then fade out the popup
    $("#devPopup").fadeIn().delay(2000).fadeOut(1000);
  });
});

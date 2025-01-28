function portfolio_menu() {
    $("#menu-toggle").click(function (e) {
      e.stopPropagation(); // 이벤트 버블링 방지
      $("#side-menu").toggleClass("open");
    });
    
    // 사이드 메뉴 영역 클릭
    $("#side-menu").click(function (e) {
      e.stopPropagation();
    });
    
    $(document).click(function () {
      $("#side-menu").removeClass("open");
    });
}
    var link = document.querySelector(".js-feedback");
    var popup = document.querySelector(".feedback");
    var close = popup.querySelector(".feedback-close");
    var bg = document.querySelector(".feedback-bg")
    

    link.addEventListener("click", function(event) {
        event.preventDefault();
        popup.classList.add("feedback-show");
        bg.classList.add("feedback-show");
        popup.classList.add("feedback-animation");
      });

    close.addEventListener("click", function(event) {
        event.preventDefault();
        popup.classList.remove("feedback-show");
        bg.classList.remove("feedback-show");
      });
    
    bg.addEventListener("click", function(event) {
        event.preventDefault();
        popup.classList.remove("feedback-show");
        bg.classList.remove("feedback-show");
    })

      window.addEventListener("keydown", function(event) {
        if (event.keyCode === 27) {
          if (popup.classList.contains("feedback-show")) {
            popup.classList.remove("feedback-show");
            bg.classList.remove("feedback-show");
          }
        }
      });
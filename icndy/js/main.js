// $('.slider').slick();
$('.slider').slick({
  dots: true,
  infinite: true,
  speed: 500,
  fade: true,
  cssEase: 'linear'
});
var insOpacity = document.querySelector(".instagram");
console.log(insOpacity)
insOpacity.addEventListener("mousewheel", function(){console.log("bla")})

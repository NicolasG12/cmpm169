const ctx = document.getElementById("myChart")

const url = "https://www.balldontlie.io/api/v1/games/";

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
const randomInteger = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const dateString = (date) => date.year.toString() + "-" + date.month.toString() + "-" + date.day.toString()

function getGame() {
  var season = randomInteger(1979, 2023);
  console.log(season);
  $.ajax({
    url: url,
    type: "GET",
    data: {
      per_page: 100,
      seasons: [season]
    },
    dataType: "json",
    success: function (result) {
      console.log(result);
      // $("body").append("<h1>100 NBA Game Scores From The " + season.toString() + "-" + (season+1).toString() + " Season");
      const chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: result.data.map(row => row.date),
          datasets: [{
            label: 'Home team score in games',
            data: result.data.map(x => x.home_team_score)
          },
          {
            label: 'Visitor team score in games between',
            data: result.data.map(x => x.visitor_team_score)
          }]
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: "100 NBA Game Scores From The " + season.toString() + "-" + (season + 1).toString() + " Season",
            },
          },
          onClick: (e) => {
            const canvasPosition = Chart.helpers.getRelativePosition(e, chart);
            const dataX = chart.scales.x.getValueForPixel(canvasPosition.x);
            var game = result.data[dataX];
            document.getElementById("game").innerHTML = "<h1 >" + game.home_team.name + " vs " + game.visitor_team.name;
            $("span").append("<h2 style='margin-left:60px'>" + game.home_team_score.toString() + "--" + game.visitor_team_score.toString());
            $("span").append("<h2>" + game.date);

          },
          interaction: {
            mode: 'index'
          }
        }
      })
    },
    error: function (xhr, status, error) {
      console.log("Error", xhr, status, error);
    }
  })
}
getGame();


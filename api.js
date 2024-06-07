const progresses = document.querySelectorAll("circle-progress");

let temp = {
  targetTemperatureData: undefined,
  currentTemperatureData: undefined,
  targetHumidityData: undefined,
  currentHumidityData: undefined
};

let targetElementArray = [];
let currentElementArray = [];
let humidityElementArray = [];

window.onload = () => {
  updateProgress(0, 0, 0, 0);
};

function addCSS(cssFilePath, elementArray) {
  const linkElement = document.createElement("link");
  linkElement.rel = "stylesheet";
  linkElement.type = "text/css";
  linkElement.href = cssFilePath;

  document.head.appendChild(linkElement);
  elementArray.push(linkElement);
}

const updateProgress = (targetValue, currentValue, targetHumidityValue, currentHumidityValue) => {
  var targetValueInt = parseInt(targetValue);
  var currentValueInt = parseInt(currentValue);
  var targetHumidityValueInt = parseInt(targetHumidityValue);
  var currentHumidityValueInt = parseInt(currentHumidityValue);

  if (
    targetValueInt <= 100 && targetValueInt >= -100 &&
    currentValueInt <= 100 && currentValueInt >= -100 &&
    targetHumidityValueInt <= 100 && targetHumidityValueInt >= 0 &&
    currentHumidityValueInt <= 100 && currentHumidityValueInt >= 0
  ) {
    if (targetValueInt < 0 || currentValueInt < 0 || targetHumidityValueInt < 0 || currentHumidityValueInt < 0) {
      if (targetElementArray.length === 0) {
        addCSS("/minus2.css", targetElementArray);
      }
      if (currentElementArray.length === 0) {
        addCSS("/minus.css", currentElementArray);
      }
      if (humidityElementArray.length === 0) {
        addCSS("/minus3.css", humidityElementArray);
      }
    } else {
      targetElementArray.forEach((linkElement) => {
        if (linkElement.getAttribute("href") === "/minus2.css") {
          linkElement.parentNode.removeChild(linkElement);
        }
      });
      currentElementArray.forEach((linkElement) => {
        if (linkElement.getAttribute("href") === "/minus.css") {
          linkElement.parentNode.removeChild(linkElement);
        }
      });
      humidityElementArray.forEach((linkElement) => {
        if (linkElement.getAttribute("href") === "/minus3.css") {
          linkElement.parentNode.removeChild(linkElement);
        }
      });
      targetElementArray = [];
      currentElementArray = [];
      humidityElementArray = [];
    }

    progresses.forEach((progress, index) => {
      if (index === 0) {
        progress.value = targetValue;
      } else if (index === 1) {
        progress.value = currentValue;
      } else if (index === 2) {
        progress.value = targetHumidityValue;
      } else if (index === 3) {
        progress.value = currentHumidityValue;
      }
      progress.textFormat = (value) => {
        return value + (index < 2 ? "°C" : "%");
      };
    });
  } else {
    progresses.forEach((progress) => {
      progress.value = -100;
      progress.textFormat = () => {
        return "Error";
      };
    });
  }
};

const handleFetchError = (error) => {
  console.log("API İsteği Hatası: " + error);
};

const fetchSession = async () => {
  try {
    const sessionData = await fetch("https://website.net/get_session.php");
    const sessionJson = await sessionData.json();
    const UserSecretKey = sessionJson.UserSecretKey;

    const data = await fetch(
      `https://website.net/api.php?UserSecretKey=${UserSecretKey}`
    );
    if (!data.ok) {
      throw new Error("API isteği başarısız: " + data.statusText);
    }
    const responseData = await data.json();

    const targetTemperature = parseFloat(responseData[0].targetTemperature);
    const currentTemperature = parseFloat(responseData[0].sendTemperature);
    const targetHumidity = parseFloat(responseData[0].target_humidity);
    const currentHumidity = parseFloat(responseData[0].Humidity);

    if (
      !isNaN(targetTemperature) && !isNaN(currentTemperature) &&
      !isNaN(targetHumidity) && !isNaN(currentHumidity)
    ) {
      temp.targetTemperatureData = targetTemperature;
      temp.currentTemperatureData = currentTemperature;
      temp.targetHumidityData = targetHumidity;
      temp.currentHumidityData = currentHumidity;
      updateProgress(
        temp.targetTemperatureData,
        temp.currentTemperatureData,
        temp.targetHumidityData,
        temp.currentHumidityData
      );
    } else {
      throw new Error("API'den hatalı sıcaklık veya nem verisi alındı");
    }
  } catch (error) {
    handleFetchError(error);
  }
};

setInterval(fetchSession, 2000);

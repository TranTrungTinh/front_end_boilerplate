const ASCVDRiskEstimatePlus = {
  female: {
    lnAge: -29.799,
    lnAgeSquared: 4.884,
    lnTotalChol: 13.54,
    lnAgeXlnTotalChol: -3.114,
    lnHdl: -13.578,
    lnAgeXlnHdl: 3.149,
    lnTreatSBP: 2.019,
    lnAgeXlnTreatSBP: 'N/A',
    lnUnTreatSBP: 1.957,
    lnAgeXlnUnTreatSBP: 'N/A',
    currentSmoker: 7.574,
    lnAgeXcurrentSmoker: -1.665,
    diabetes: 0.661,
    s010Ret: 0.9665, // ? mean Baseline Survival
    mnxbRet: -29.1817 // ? mean Mean (Coefficient × Value)
  },
  male: {
    lnAge: 12.344,
    lnAgeSquared: 'N/A',
    lnTotalChol: 11.853,
    lnAgeXlnTotalChol: -2.664,
    lnHdl: -7.990,
    lnAgeXlnHdl: 1.769,
    lnTreatSBP: 1.797,
    lnAgeXlnTreatSBP: 'N/A',
    lnUnTreatSBP: 1.764,
    lnAgeXlnUnTreatSBP: 'N/A',
    currentSmoker: 7.837,
    lnAgeXcurrentSmoker: -1.795,
    diabetes: 0.658,
    s010Ret: 0.9144, // ? mean Baseline Survival
    mnxbRet: 61.1816 // ? mean Mean (Coefficient × Value)
  }
}
// /**
//    * Creates a default Patient model for the application with all undefined fields and
//    * resolves the promise used when retrieving patient information. Also sets to hide the
//    * demo banner for the application.
//    */
const setDefaultPatient = (patientInfo) => {
  const PatientInfo = {}
  PatientInfo.firstName = undefined
  PatientInfo.lastName = patientInfo.aFullName
  PatientInfo.gender = patientInfo.aGender
  PatientInfo.dateOfBirth = undefined
  PatientInfo.age = patientInfo.aAge

  const relatedFactors = {}
  relatedFactors.smoker = patientInfo.aSmokingStatus
  relatedFactors.race = 'other' // it mean Asia
  relatedFactors.hypertensive = patientInfo.aTreatmentHypertensionStatus
  relatedFactors.diabetic = patientInfo.aDiabetesStatus
  PatientInfo.relatedFactors = relatedFactors

  PatientInfo.totalCholesterol = patientInfo.aTotalCholesterol
  PatientInfo.hdl = patientInfo.aHdlCholesterol
  PatientInfo.systolicBloodPressure = patientInfo.aSBloodPressure

  return PatientInfo
}

const isNA = value => value === 'N/A'

/**
 * Computes the ASCVD Risk Estimate for an individual over the next 10 years.
 * @param patientInfo - patientInfo object from ASCVDRisk data model
 * @returns {*} Returns the risk score or null if not in the appropriate age range
 */
const computeRiskEstimated = (patientInfo) => {
  if (patientInfo.age < 40 || patientInfo.age > 79) { return null }
  const lnAge = Math.log(patientInfo.age)
  const lnAgeSquared = Math.log(patientInfo.age ** 2)
  const lnTotalChol = Math.log(patientInfo.totalCholesterol)
  const lnHdl = Math.log(patientInfo.hdl)
  const trlnsbp = patientInfo.relatedFactors.hypertensive
    ? Math.log(parseFloat(patientInfo.systolicBloodPressure)) : 0
  const ntlnsbp = patientInfo.relatedFactors.hypertensive
    ? 0 : Math.log(parseFloat(patientInfo.systolicBloodPressure))
  const ageTotalChol = lnAge * lnTotalChol
  const ageHdl = lnAge * lnHdl
  const ageSmoke = patientInfo.relatedFactors.smoker ? lnAge : 0
  const coefficientDefault = ASCVDRiskEstimatePlus[patientInfo.gender] || ASCVDRiskEstimatePlus.male

  const { s010Ret, mnxbRet } = coefficientDefault
  const predictRet = (coefficientDefault.lnAge * lnAge) +
  (isNA(coefficientDefault.lnAgeSquared) ? 0 : (coefficientDefault.lnAgeSquared * lnAgeSquared)) +
  (coefficientDefault.lnTotalChol * lnTotalChol) +
  (coefficientDefault.lnAgeXlnTotalChol * ageTotalChol) +
  (coefficientDefault.lnHdl * lnHdl) +
  (coefficientDefault.lnAgeXlnHdl * ageHdl) +
  (coefficientDefault.lnTreatSBP * trlnsbp) +
  (coefficientDefault.lnUnTreatSBP * ntlnsbp) +
  (coefficientDefault.currentSmoker * Number(patientInfo.relatedFactors.smoker)) +
  (coefficientDefault.lnAgeXcurrentSmoker * ageSmoke) +
  (coefficientDefault.diabetes * Number(patientInfo.relatedFactors.diabetic))
  const riskEstimate = (1 - (s010Ret ** Math.exp(predictRet - mnxbRet)))

  const parseAgeType = (number, prefix = 'progress') => {
    if (number < 40) { return `${prefix}-green` }
    if (number >= 40 && number <= 60) { return `${prefix}-orange` }
    if (number > 60) { return `${prefix}-red` }
  }

  const parseBloodPressure = (number, prefix = 'progress') => {
    if (number > 140) { return `${prefix}-red` }
    return `${prefix}-green`
  }

  const parseTotalCholesterol = (number, prefix = 'progress') => {
    if (number <= 200) { return `${prefix}-green` }
    if (number > 200 && number < 240) { return `${prefix}-orange` }
    return `${prefix}-red`
  }

  const parseHDL = (number, isFemale, prefix = 'progress') => {
    if (number >= 20 && number <= 100) {
      return `${prefix}-green`
    } else {
      return `${prefix}-red`
    }
  }

  const parseTrue = isTrue => isTrue ? 'progress-red' : 'progress-green'

  const parseGauge = (age) => {
    const averageRisk = {
      40: 0.6,
      41: 0.7,
      42: 0.8,
      43: 0.9,
      44: 1,
      45: 1.2,
      46: 1.3,
      47: 1.5,
      48: 1.7,
      49: 0.9,
      50: 2.1,
      51: 2.4,
      52: 2.6,
      53: 2.9,
      54: 3.2,
      55: 3.6,
      56: 3.9,
      57: 4.3,
      58: 4.8,
      59: 5.2,
      60: 5.7,
      61: 6.3,
      62: 6.9,
      63: 7.5,
      64: 8.1,
      65: 8.8,
      66: 9.6,
      67: 10.4,
      68: 11.2,
      69: 12.1,
      70: 13.1,
      71: 14.1,
      72: 15.1,
      73: 16.2,
      74: 17.4,
      75: 18.6,
      76: 19.9,
      77: 21.2,
      78: 22.6,
      79: 24
    }

    const currentPercent = averageRisk[age]

    if (currentPercent < 10 && currentPercent >= 0) {
      return {
        thresHold: currentPercent,
        maxGauge: 10
      }
    }

    if (currentPercent >= 10 && currentPercent < 20) {
      return {
        thresHold: currentPercent,
        maxGauge: 20
      }
    }

    return {
      thresHold: currentPercent,
      maxGauge: 50
    }
  }

  const parseRange = (number, thresHold = 5) => {
    if (number < thresHold) { return { text: 'Low', class: 'green' } }
    if (number >= thresHold) { return { text: 'High', class: 'red' } }
  }

  const percentRiskEstimate = Math.ceil(Math.round((riskEstimate * 100) * 10) / 10)
  const gauge = parseGauge(patientInfo.age)

  return {
    riskEstimate: percentRiskEstimate,
    range: parseRange(percentRiskEstimate, gauge.thresHold),
    gauge,
    patient: {
      age: {
        value: patientInfo.age,
        className: parseAgeType(patientInfo.age)
      },
      bloodPressure: {
        value: patientInfo.systolicBloodPressure,
        className: parseBloodPressure(patientInfo.systolicBloodPressure)
      },
      totalChol: {
        value: patientInfo.totalCholesterol,
        className: parseTotalCholesterol(patientInfo.totalCholesterol)
      },
      hdlChol: {
        value: patientInfo.hdl,
        className: parseHDL(patientInfo.hdl, patientInfo.gender === 'female')
      },
      diabetes: {
        value: patientInfo.relatedFactors.diabetic,
        className: parseTrue(patientInfo.relatedFactors.diabetic)
      },
      currentSmoker: {
        value: patientInfo.relatedFactors.smoker,
        className: parseTrue(patientInfo.relatedFactors.smoker)
      },
      hypertensive: {
        value: patientInfo.relatedFactors.hypertensive,
        className: parseTrue(patientInfo.relatedFactors.hypertensive)
      }
    }
  }
}

const drawUiAscvd = (payload) => {
  // TODO: show loading
  $('#btn-loading').css("display","inline")
  $('#ascvd-btn').prop('disabled', true)
  
  const transformData = setDefaultPatient(payload)
  const result = computeRiskEstimated(transformData)
  console.log(result)
  console.log(payload)

  setTimeout(() => {

    // TODO: set
    $("#ascvd").attr("data-units", result.riskEstimate + '%');
    $("#ascvd").attr("data-value", result.riskEstimate);
    $("#ascvd").attr("data-max-value", result.gauge.maxGauge);
    $("#ascvd").attr("data-major-ticks", `[0, ${result.gauge.thresHold}, ${result.gauge.maxGauge}]`);
    $("#ascvd").attr("data-highlights",`[
      { "from": 0, "to": ${result.gauge.thresHold}, "color": "#2ecc71" },
      { "from": ${result.gauge.thresHold}, "to": ${result.gauge.maxGauge}, "color": "#e74c3c" }
    ]`);
  
    $("#description-threshold-1").text(result.gauge.thresHold);
    $("#description-threshold-2").text(result.gauge.thresHold);
    $("#risk-level").text(result.range.text === 'High' ? 'Cao' : 'Thấp');
    
    // TODO: show modal result
    $('#modalAscvd').modal('hide');
    $('#ascvdResultModal').modal('show');

    // TODO: off loading
    $('#ascvd-btn').removeAttr('disabled')
    $('#btn-loading').css("display","none")
  }, 1500)
}


$('#ascvd-btn').click(e => {
  e.preventDefault()

  const aAge = $('#ascvd-age').val()
  const aSBloodPressure = $('#ascvd-blood').val()
  const aTotalCholesterol = $('#ascvd-chl').val()
  const aHdlCholesterol = $('#ascvd-hdl').val()

  const aDiabetesStatus = $('input[name=r1][value=true]:checked').val()
  const aSmokingStatus = $('input[name=r2][value=true]:checked').val()
  const aTreatmentHypertensionStatus = $('input[name=r3][value=true]:checked').val()

  drawUiAscvd({
    aGender: 'male',
    aAge: +aAge,
    aSBloodPressure: +aSBloodPressure,
    aTotalCholesterol: +aTotalCholesterol,
    aHdlCholesterol: +aHdlCholesterol,
    aDiabetesStatus: Boolean(aDiabetesStatus),
    aSmokingStatus: Boolean(aSmokingStatus),
    aTreatmentHypertensionStatus: Boolean(aTreatmentHypertensionStatus)
  })
})

$('#ascvd-data-sample').click(e => {
  e.preventDefault()

  drawUiAscvd({
    aGender: 'male',
    aAge: 64,
    aSBloodPressure: 122,
    aTotalCholesterol: 135,
    aHdlCholesterol: 58,
    aDiabetesStatus: true,
    aSmokingStatus: true,
    aTreatmentHypertensionStatus: true
  })
})

$('#diabetes-btn').click(e => {
  e.preventDefault()

  // TODO: show loading
  $('#btn-diabetes-loading').css("display","inline")
  $('#diabetes-btn').prop('disabled', true)

  const age = $('#diabetes-age').val()
  const fastGlucose = $('#diabetes-fastGluco').val()
  const bmi = $('#diabetes-bmi').val()
  const serumInsulin = $('#diabetes-insulin').val()
  const aDBloodPressure = $('#diabetes-dBlood').val()

  const input = `${aDBloodPressure},${serumInsulin},${bmi},${fastGlucose},${age}`
  fetch(`https://ep.diabetes.precisionmed.dev/inference/model_15k/RandomForest.pkl/${input}/true`, {
    headers: {
      Accept: 'application/json, text/plain, */*'
    }
  })
  .then(res => res.json())
  .then(data => {
    const riskEstimate = data.result[0] * 100
    
    // TODO: set
    $("#diabetes").attr("data-units", riskEstimate + '%');
    $("#diabetes").attr("data-value", riskEstimate);
    $("#diabetes").attr("data-max-value", 100);
    $("#diabetes").attr("data-major-ticks", `[0, ${riskEstimate}, 100]`);
    $("#diabetes").attr("data-highlights",`[
      { "from": 0, "to": ${riskEstimate}, "color": "#2ecc71" },
      { "from": ${riskEstimate}, "to": 100, "color": "#e74c3c" }
    ]`);
    $("#diabetes-risk").text(riskEstimate);
  })
  .finally(() => {
    // TODO: show modal result
    $('#modalDiabetes').modal('hide');
    $('#diabetesResultModal').modal('show');

    // TODO: off loading
    $('#btn-diabetes-loading').css("display","none")
    $('#diabetes-btn').removeAttr('disabled')
  })
})


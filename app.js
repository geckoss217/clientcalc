const CONFIG = {

  supportEmail: 'support@emergencycleanings.com',

  homeUrl: 'https://emergencycleanings.com/',



  /*

    To send automatically without opening the user's email app,

    paste a backend or form endpoint here.



    Examples:

    - Formspree endpoint

    - Netlify Forms endpoint

    - Custom server endpoint



    Leave empty to use mailto fallback.

  */

  formEndpoint: ''

};



let currentStep = 0;

const totalSteps = 6;



const stepHints = [

  'Contact information',

  'Property type',

  'Cleanup level',

  'Areas affected',

  'Special conditions',

  'Send request'

];



function money(value) {

  return new Intl.NumberFormat('en-US', {

    style: 'currency',

    currency: 'USD',

    maximumFractionDigits: 0

  }).format(value);

}



function getText(id) {

  const el = document.getElementById(id);

  return el ? String(el.value || '').trim() : '';

}



function getRadioNumber(name) {

  const selected = document.querySelector(`input[name="${name}"]:checked`);

  return selected ? Number(selected.value) : 0;

}



function getRadioLabel(name) {

  const selected = document.querySelector(`input[name="${name}"]:checked`);



  if (!selected) {

    return '';

  }



  const label = selected.closest('label');

  const strong = label ? label.querySelector('strong') : null;



  return strong ? strong.textContent.trim() : '';

}



function getSelectNumber(id) {

  const el = document.getElementById(id);

  return el ? Number(el.value || 0) : 0;

}



function getSelectLabel(id) {

  const el = document.getElementById(id);



  if (!el || !el.selectedOptions || !el.selectedOptions[0]) {

    return '';

  }



  return el.selectedOptions[0].textContent.trim();

}



function clearEstimateDisplay() {

  document.getElementById('estimateRange').textContent = '$0 â $0';

  document.getElementById('depositAmount').textContent = '$0';

  document.getElementById('projectType').textContent = 'Pending';

  window.currentEstimate = null;

}



function calculateEstimate() {

  const hasPropertyType = !!document.querySelector('input[name="propertyType"]:checked');

  const hasClutterLevel = !!document.querySelector('input[name="clutterLevel"]:checked');

  const hasAreasAffected = !!document.querySelector('input[name="areasAffected"]:checked');

  const hasCondition = !!document.querySelector('input[name="condition"]:checked');



  if (!hasPropertyType && !hasClutterLevel && !hasAreasAffected && !hasCondition) {

    clearEstimateDisplay();

    return null;

  }



  const propertyType = getRadioNumber('propertyType') || 0;

  const clutterLevel = getRadioNumber('clutterLevel') || 0;

  const areasAffected = getRadioNumber('areasAffected') || 0;

  const condition = getRadioNumber('condition') || 0;

  const urgency = getSelectNumber('urgency') || 1.05;



  const subtotal = propertyType + clutterLevel + areasAffected + condition;



  if (subtotal <= 0) {

    clearEstimateDisplay();

    return null;

  }



  const calculated = subtotal * urgency;



  const low = Math.max(450, calculated * 0.70);

  const high = calculated * 1.05;

  const deposit = low * 0.20;



  let projectType = 'Standard Cleanup';



  if (high < 1500) {

    projectType = 'Small Cleanup';

  } else if (high >= 1500 && high < 3800) {

    projectType = 'Moderate Cleanup';

  } else if (high >= 3800 && high < 7500) {

    projectType = 'Large Cleanup';

  } else {

    projectType = 'Complex Cleanup';

  }



  document.getElementById('estimateRange').textContent = `${money(low)} â ${money(high)}`;

  document.getElementById('depositAmount').textContent = money(deposit);

  document.getElementById('projectType').textContent = projectType;



  window.currentEstimate = {

    low,

    high,

    deposit,

    projectType,

    nextStep: 'Property review'

  };



  return window.currentEstimate;

}



function goToStep(stepIndex) {

  if (stepIndex < 0) {

    stepIndex = 0;

  }



  if (stepIndex > totalSteps - 1) {

    stepIndex = totalSteps - 1;

  }



  currentStep = stepIndex;



  const slides = document.getElementById('slides');

  slides.style.transform = `translateX(-${currentStep * 100}%)`;



  document.getElementById('stepLabel').textContent = `Step ${currentStep + 1} of ${totalSteps}`;

  document.getElementById('stepHint').textContent = stepHints[currentStep];

  document.getElementById('progressFill').style.width = `${((currentStep + 1) / totalSteps) * 100}%`;



  calculateEstimate();

}



function autoNext() {

  calculateEstimate();



  setTimeout(() => {

    if (currentStep < totalSteps - 1) {

      goToStep(currentStep + 1);

    }

  }, 280);

}



function isValidEmail(email) {

  return /^[^ @]+@[^ @]+\.[^ @]{2,}$/.test(String(email || '').trim());

}



function validateContact(showAlert) {

  const firstName = getText('firstName');

  const lastName = getText('lastName');

  const phone = getText('phone');

  const email = getText('email');



  if (!firstName || !lastName) {

    if (showAlert) alert('Please enter your first and last name.');

    return false;

  }



  if (!phone) {

    if (showAlert) alert('Please enter your phone number.');

    return false;

  }



  if (!isValidEmail(email)) {

    if (showAlert) alert('Please enter a valid email address.');

    return false;

  }



  return true;

}



function validateEstimateSelections(showAlert) {

  const requiredGroups = [

    {

      name: 'propertyType',

      message: 'Please choose the type of place that needs help.'

    },

    {

      name: 'clutterLevel',

      message: 'Please choose how much cleanup is needed.'

    },

    {

      name: 'areasAffected',

      message: 'Please choose how many areas are affected.'

    },

    {

      name: 'condition',

      message: 'Please choose if there are any special conditions.'

    }

  ];



  for (const group of requiredGroups) {

    const selected = document.querySelector(`input[name="${group.name}"]:checked`);



    if (!selected) {

      if (showAlert) alert(group.message);

      return false;

    }

  }



  return true;

}



function continueFromContact() {

  if (!validateContact(true)) {

    return;

  }



  goToStep(1);

}



function showStatus(type, message) {

  const el = document.getElementById('sendStatus');

  el.className = type;

  el.textContent = message;

  el.style.display = 'block';



  el.scrollIntoView({

    behavior: 'smooth',

    block: 'center'

  });

}



function hideStatus() {

  const el = document.getElementById('sendStatus');

  el.className = '';

  el.textContent = '';

  el.style.display = 'none';

}



function updateSelectedChoices() {

  document.querySelectorAll('.choice').forEach((label) => {

    const input = label.querySelector('input[type="radio"]');



    if (input && input.checked) {

      label.classList.add('selected');

    } else {

      label.classList.remove('selected');

    }

  });

}



function resetForm() {

  document.getElementById('estimateForm').reset();

  hideStatus();

  updateSelectedChoices();

  clearEstimateDisplay();

  goToStep(0);

}



function buildPayload() {

  if (!window.currentEstimate) {

    calculateEstimate();

  }



  return {

    firstName: getText('firstName'),

    lastName: getText('lastName'),

    fullName: `${getText('firstName')} ${getText('lastName')}`.trim(),

    phone: getText('phone'),

    email: getText('email'),

    address: getText('address'),



    propertyType: getRadioLabel('propertyType'),

    clutterLevel: getRadioLabel('clutterLevel'),

    areasAffected: getRadioLabel('areasAffected'),

    urgency: getSelectLabel('urgency'),

    condition: getRadioLabel('condition'),

    notes: getText('notes'),



    lowRange: money(window.currentEstimate.low),

    highRange: money(window.currentEstimate.high),

    deposit: money(window.currentEstimate.deposit),

    projectType: window.currentEstimate.projectType,

    nextStep: window.currentEstimate.nextStep

  };

}



function sendEstimateRequest() {

  calculateEstimate();



  if (!validateContact(true)) {

    goToStep(0);

    return;

  }



  if (!validateEstimateSelections(true)) {

    goToStep(1);

    return;

  }



  document.getElementById('confirmEstimateRange').textContent =

    document.getElementById('estimateRange').textContent;



  document.getElementById('confirmOverlay').classList.add('active');

}



function declineContact() {

  window.location.href = CONFIG.homeUrl;

}



function confirmContactAndSend() {

  document.getElementById('confirmOverlay').classList.remove('active');

  sendEstimateToSupport();

}



async function sendEstimateToSupport() {

  calculateEstimate();



  const btn = document.getElementById('sendBtn');

  const payload = buildPayload();



  btn.disabled = true;

  btn.textContent = 'Sending...';

  hideStatus();



  try {

    if (CONFIG.formEndpoint) {

      await sendToEndpoint(payload);

    } else {

      openMailClient(payload);

    }



    showStatus(

      'success',

      'Thank you. One of our Project Managers will contact you shortly.'

    );



    document.getElementById('estimateForm').reset();

    resetForm();



  } catch (error) {

    console.error(error);



    showStatus(

      'error',

      'Sorry, something went wrong. Please call us or try again.'

    );



  } finally {

    btn.disabled = false;

    btn.textContent = 'Send My Request';

  }

}



async function sendToEndpoint(payload) {

  const response = await fetch(CONFIG.formEndpoint, {

    method: 'POST',

    headers: {

      'Content-Type': 'application/json'

    },

    body: JSON.stringify(payload)

  });



  if (!response.ok) {

    throw new Error(`Form endpoint failed with status ${response.status}`);

  }



  return response;

}



function openMailClient(payload) {

  const subject = `New Cleanup Estimate Request - ${payload.fullName}`;



  const body = [

    'Emergency Cleanings - New Cleanup Estimate Request',

    '',

    'Client reviewed the estimated range and requested contact.',

    '',

    'Estimated Range:',

    `${payload.lowRange} - ${payload.highRange}`,

    `Suggested Deposit: ${payload.deposit}`,

    '',

    'Client Information:',

    `Name: ${payload.fullName}`,

    `Phone: ${payload.phone}`,

    `Email: ${payload.email}`,

    `Service Location: ${payload.address || 'Not provided'}`,

    '',

    'Project Summary:',

    `Property Type: ${payload.propertyType}`,

    `Cleanup Level: ${payload.clutterLevel}`,

    `Areas Affected: ${payload.areasAffected}`,

    `Special Conditions: ${payload.condition}`,

    `Urgency: ${payload.urgency}`,

    `Cleanup Size: ${payload.projectType}`,

    `Next Step: ${payload.nextStep}`,

    '',

    'Client Notes:',

    payload.notes || 'No additional notes provided.',

    '',

    'Internal Reminder:',

    'This is a preliminary estimate only. Final pricing requires property review.'

  ].join('\n');



  const mailtoUrl =

    `mailto:${encodeURIComponent(CONFIG.supportEmail)}` +

    `?subject=${encodeURIComponent(subject)}` +

    `&body=${encodeURIComponent(body)}`;



  window.location.href = mailtoUrl;

}



document.addEventListener('DOMContentLoaded', () => {

  updateSelectedChoices();

  clearEstimateDisplay();

  goToStep(0);



  document.querySelectorAll('input[type="radio"]').forEach((input) => {

    input.addEventListener('change', () => {

      updateSelectedChoices();

      autoNext();

    });

  });



  document

    .querySelectorAll('#estimateForm input[type="text"], #estimateForm input[type="tel"], #estimateForm input[type="email"], #estimateForm textarea, #estimateForm select')

    .forEach((element) => {

      element.addEventListener('input', calculateEstimate);

      element.addEventListener('change', calculateEstimate);

    });

});

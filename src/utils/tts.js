/**
 * Web Speech API Text-to-Speech Helper for QueueGo
 * Format: "Nomor antrean [QUEUE_NUMBER] atas nama [CUSTOMER_NAME], Silakan Menuju [COUNTER_NAME]"
 */
export const playQueueAnnouncement = (queueNumber, customerName, counterName) => {
  if (!('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis is not supported in this browser.');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const formattedName = customerName && customerName.trim() !== '' && customerName !== 'Pelanggan' && customerName !== 'Tanpa Nama'
    ? ` atas nama ${customerName}`
    : '';

  const cleanCounterName = counterName ? counterName : 'Loket Tujuan';

  const announcementText = `Nomor antrean ${queueNumber}${formattedName}, Silakan Menuju ${cleanCounterName}`;

  const utterance = new SpeechSynthesisUtterance(announcementText);
  utterance.lang = 'id-ID';
  utterance.rate = 0.85; // Slightly slower for clear pronunciation
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  // Find Indonesian voice if available
  const voices = window.speechSynthesis.getVoices();
  const idVoice = voices.find(v => v.lang.includes('id') || v.lang.includes('ID'));
  if (idVoice) {
    utterance.voice = idVoice;
  }

  window.speechSynthesis.speak(utterance);
};

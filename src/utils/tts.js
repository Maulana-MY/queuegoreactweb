/**
 * Web Speech API Text-to-Speech Helper for QueueGo
 * Format: "Nomor antrean [QUEUE_NUMBER] atas nama [CUSTOMER_NAME], Silakan Menuju [COUNTER_NAME]"
 */

let globalAnnouncedQueueKey = null;

export const playQueueAnnouncement = (queueNumber, customerName, counterName) => {
  if (!('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis is not supported in this browser.');
    return;
  }

  // Force resume if speech synthesis engine was paused or stuck in Chrome
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const formattedName = customerName && customerName.trim() !== '' && customerName !== 'Pelanggan' && customerName !== 'Tanpa Nama'
    ? ` atas nama ${customerName}`
    : '';

  const cleanCounterName = counterName ? counterName : 'Loket Tujuan';
  const announcementText = `Nomor antrean ${queueNumber}${formattedName}, Silakan Menuju ${cleanCounterName}`;

  const speakText = () => {
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

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

      console.log('🗣️ QueueGo TTS Announcing:', announcementText);
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Error playing TTS queue announcement:', err);
    }
  };

  // 150ms timeout ensures Chrome audio engine releases previous speech before speaking new utterance
  setTimeout(speakText, 150);
};

/**
 * Announce queue call/recall only once globally across component remounts & tab switching
 */
export const announceQueueIfNeeded = (queueId, calledAt, queueNumber, customerName, counterName) => {
  if (!queueId || !calledAt) return;

  const announcementKey = `${queueId}_${calledAt}`;

  // Check in-memory global state
  if (globalAnnouncedQueueKey === announcementKey) {
    return;
  }

  // Check sessionStorage persistent state across tab remounts
  const savedKey = sessionStorage.getItem('queuego_last_announced_key');
  if (savedKey === announcementKey) {
    globalAnnouncedQueueKey = announcementKey;
    return;
  }

  // Record key globally and in sessionStorage
  globalAnnouncedQueueKey = announcementKey;
  try {
    sessionStorage.setItem('queuego_last_announced_key', announcementKey);
  } catch (e) {
    // Ignore storage quota errors
  }

  // Play announcement
  playQueueAnnouncement(queueNumber, customerName, counterName);
};

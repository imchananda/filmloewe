export type Language = 'th' | 'en';

export const translations = {
    th: {
        // Header
        appTitle: '✨ Film x Loewe Mission',
        all: 'ทั้งหมด',
        hide: '✓ ซ่อน',
        show: '○ แสดง',

        // Loading
        loading: 'กำลังโหลดข้อมูล...',
        error: 'ไม่สามารถโหลดข้อมูลได้ กรุณาตรวจสอบ Google Sheet URL',

        // Stats
        pending: 'รอทำ',
        done: 'เสร็จ',
        progress: 'progress',
        completed: 'เสร็จแล้ว',

        // Task list
        noTitle: 'ไม่มีชื่อเรื่อง',
        scrollToLoad: 'เลื่อนเพื่อโหลดเพิ่ม...',
        noTasks: 'ยังไม่มีรายการ',
        allDone: 'ทำครบหมดแล้ว!',

        // Modal
        hashtagsLabel: '📝 Hashtags ที่ต้องใช้:',
        noHashtags: 'ไม่มี Hashtags',
        copied: '✓ คัดลอกแล้ว!',
        copyText: '📋 คัดลอกข้อความ',
        goPost: '🚀 ไปโพสต์เลย!',
        markDone: '✓ ทำเสร็จแล้ว',
    },
    en: {
        // Header
        appTitle: '✨ Film x Loewe Mission',
        all: 'All',
        hide: '✓ Hide',
        show: '○ Show',

        // Loading
        loading: 'Loading...',
        error: 'Failed to load data. Please check Google Sheet URL',

        // Stats
        pending: 'Pending',
        done: 'Done',
        progress: 'progress',
        completed: 'Completed',

        // Task list
        noTitle: 'No title',
        scrollToLoad: 'Scroll to load more...',
        noTasks: 'No tasks yet',
        allDone: 'All done!',

        // Modal
        hashtagsLabel: '📝 Hashtags to use:',
        noHashtags: 'No hashtags',
        copied: '✓ Copied!',
        copyText: '📋 Copy text',
        goPost: '🚀 Go post!',
        markDone: '✓ Mark as done',
    },
} as const;

export type TranslationKey = keyof typeof translations.th;

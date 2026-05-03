import { Page } from '../models/index.js';

async function seedPages() {
  try {
    const pages = [
      {
        title: 'سياسة الخصوصية',
        slug: 'privacy-policy',
        content: '<h1>سياسة الخصوصية</h1><p>هذا محتوى افتراضي. يُرجى تحديثه من لوحة الإدارة.</p>',
        meta_title: 'سياسة الخصوصية',
        meta_description: 'سياسة الخصوصية — بوتفيد',
        status: true,
        sort_order: 1
      },
      {
        title: 'الشروط والأحكام',
        slug: 'terms-and-conditions',
        content: '<h1>الشروط والأحكام</h1><p>هذا محتوى افتراضي. يُرجى تحديثه من لوحة الإدارة.</p>',
        meta_title: 'الشروط والأحكام',
        meta_description: 'الشروط والأحكام — بوتفيد',
        status: true,
        sort_order: 2
      },
      {
        title: 'سياسة الاسترداد',
        slug: 'refund-policy',
        content: '<h1>سياسة الاسترداد</h1><p>هذا محتوى افتراضي. يُرجى تحديثه من لوحة الإدارة.</p>',
        meta_title: 'سياسة الاسترداد',
        meta_description: 'سياسة الاسترداد — بوتفيد',
        status: true,
        sort_order: 3
      }
    ];

    for (const pageData of pages) {
      await Page.findOneAndUpdate(
        { slug: pageData.slug },
        pageData,
        { upsert: true, new: true }
      );
    }

    console.log('Pages seeded successfully!');
  } catch (error) {
    console.error('Error seeding pages:', error);
    throw error;
  }
}

export default seedPages;

import { LandingPage, Plan, Testimonial, Faq } from '../models/index.js';
import { uploader } from '../utils/upload.js';

const getLandingPage = async (req, res) => {
  try {
    let landingPage = await LandingPage.findOne();

    if (!landingPage) {
      landingPage = new LandingPage({
        hero_section: {
          badge: 'حيث يلتقي عميلك بك — على كل الشبكات',
          title: 'منصّة واحدة لكل قنوات التواصل التي تعتني بها علامتك',
          description:
            'سواء رسالة مباشرة أو تعليق أو دردشة: نظّم الحوار، أتمِ المتابعة، وتابع الأداء من لوحة واحدة — دون أن تضيع بين تبويبات لا تنتهي.',
          primary_button: { text: 'ابدأ الآن', link: '/signup' },
          hero_image: '/uploads/landing/1000x550.svg',
          floating_images: [
            { url: '/uploads/landing/250x250.svg', position: 'left-top' },
            { url: '/uploads/landing/250x250.svg', position: 'right-top' },
            { url: '/uploads/landing/250x250.svg', position: 'left-bottom' },
            { url: '/uploads/landing/250x250.svg', position: 'right-bottom' },
          ],
        },
        features_section: {
          badge: 'لماذا بوتفيد؟',
          title: 'من المحادثة الأولى إلى عميل يثق بك',
          description:
            'أدوات لمن يريد أن يُسمَع عبر شبكات التواصل التي يختارها جمهوره دون ضجيج، وأن يبيع دون إزعاج — مع أتمتة تُنجز عنك التفاصيل المملّة.',
          cta_button: { text: 'استكشف المميزات', link: '/signup' },
          features: [
            {
              title: 'مكتبة قوالب جاهزة للانطلاق',
              description:
                'قوالب واعتمادات رسمية عبر شبكات التواصل التي تخدمها — اختَر ما يناسب حملتك في ثوانٍ',
              icon: 'ai.svg',
              image: '/uploads/landing/450x300.svg',
            },
            {
              title: 'صندوق محادثات واحد لكل فريقك',
              description:
                'اجمع محادثات شبكاتك في مكان واحد — دون القفز بين تطبيقات لا تعدّ ولا تحصى',
              icon: 'bot.svg',
              image: '/uploads/landing/450x300.svg',
            },
            {
              title: 'مولّد قوالب بالذكاء الاصطناعي',
              description:
                'صِغ رسائل احترافية بلهجة علامتك — لتناسب أسلوب كل شبكة بضغطة بدل ساعات الصياغة',
              icon: 'broadcast.svg',
              image: '/uploads/landing/450x300.svg',
            },
            {
              title: 'إدارة مهام الوكلاء بذكاء',
              description: 'وزّع المحادثات، تابع الإنجاز، واضمن أن كل عميل يجد من يردّ عليه',
              icon: 'inbox.svg',
              image: '/uploads/landing/450x300.svg',
            },
            {
              title: 'استيراد جهات الاتصال دفعة واحدة',
              description: 'ارفع قوائمك، نظّم شرائح جمهورك، ووجّه رسالتك لمن يهمّه الأمر',
              icon: '',
              image: '/uploads/landing/450x300.svg',
            },
            {
              title: 'تكامل كتالوج المتجر داخل المحادثة',
              description: 'اعرض منتجاتك حيث يقرّر العميل — داخل نفس نافذة الحوار على القناة المناسبة',
              icon: '',
              image: '/uploads/landing/450x300.svg',
            },
            {
              title: 'مزامنة القوالب والموافقات من المنصّات المتصلة',
              description:
                'ما يُعتمد رسمياً على شبكاتك يصل إلى لوحتك فوراً — بلا نسخ يدوي أو تأخير بين الأنظمة',
              icon: '',
              image: '/uploads/landing/450x300.svg',
            },
            {
              title: 'ويب هوك للمتجر الإلكتروني',
              description:
                'من تأكيد الطلب إلى الشحن: تنبيهات تلقائية عبر القنوات التي يتابعك بها عميلك',
              icon: '',
              image: '/uploads/landing/450x300.svg',
            },
            {
              title: 'تحليلات تعطيك قراراً وليس فقط أرقاماً',
              description:
                'تابع الحملات والتفاعل عبر القنوات لحظة بلحظة — واعرف ماذا تكرّر وماذا تُحسّن',
              icon: '',
              image: '/uploads/landing/450x300.svg',
            },
          ],
        },
        platform_section: {
          badge: 'كيف تعمل المنصة',
          title: 'منصة واحدة… ومسار واضح عبر القنوات — من أول تفاعل إلى ولاء العميل',
          items: [
            {
              step: 1,
              tagline: 'لا تفوّت فرصة',
              title: 'منشئ تدفّقات بصري — دون سطر برمجة',
              description:
                'ارسم رحلة العميل كما تتخيّلها على أي شبكة تخدمها: ردود فورية، تفرّعات ذكية، وتلقيط للمهتمين قبل أن يغادروا الحوار.',
              bullets: [
                'منشئ تدفّقات بالسحب والإفلات',
                'تشغيل بالكلمات المفتاحية والأزرار',
                'منطق محادثة متعدد الخطوات',
                'مسارات مخصّصة لالتقاط العملاء المحتملين',
              ],
              image: '/uploads/landing/950x550.svg',
            },
            {
              step: 2,
              tagline: 'قنواتك في مكان واحد',
              title: 'ربط شبكات التواصل الرسمية بخطوات موجّهة',
              description:
                'فعّل القنوات التي تعتمدها علامتك عبر المسارات الرسمية المعتمدة — دون أن تغرق في إعدادات تقنية متفرقة بين كل شبكة.',
              bullets: [
                'مسارات تسجيل وربط رسمية حيث تنطبق على كل قناة',
                'عدة قنوات تحت إشراف فريق واحد',
                'مصادقة آمنة وصلاحيات واضحة',
                'أقلّ احتكاك بين «التفعيل» و«أول حملة أو رد فعلي»',
              ],
              image: '/uploads/landing/950x550.svg',
            },
            {
              step: 3,
              tagline: 'للمتاجر',
              title: 'تحديثات الطلب تصل قبل أن يسأل العميل «وين طلبي؟»',
              description:
                'أبلغ عملاءك تلقائياً عند كل مرحلة عبر القنوات التي تربطها بمتجرك: تأكيد، شحن، تسليم — فتنخفض الاستفسارات ويرتفع الثقة.',
              bullets: [
                'رسائل تأكيد الطلب',
                'إشعارات الشحن والتجهيز',
                'تأكيد التسليم',
                'تنبيهات الإلغاء والاسترداد',
              ],
              image: '/uploads/landing/950x550.svg',
            },
            {
              step: 4,
              tagline: 'تسويق بذوق',
              title: 'حملات بث تصل لمن يهمّهم — في الوقت الذي تختاره',
              description:
                'أعلن عن عروضك وإطلاقاتك عبر أكثر من شبكة — مع جدولة دقيقة، شرائح جمهور، وتقارير تُبيّن ما نجح.',
              bullets: [
                'حملات وبث عبر قنوات متعددة حسب ما تفعّل في حسابك',
                'جدولة الحملات بالتاريخ والوقت',
                'استهداف حسب الوسوم',
                'تحليلات وتقارير للحملات',
              ],
              image: '/uploads/landing/950x550.svg',
            },
            {
              step: 5,
              tagline: 'للمطوّرين',
              title: 'واجهات برمجية تربط قنوات التواصل بأنظمة عملك',
              description:
                'أرسل واستقبل، أدر المحادثات، وادمج المنصّة مع تطبيقاتك ومتجرك عبر واجهات آمنة — لتبقى شبكاتك جزءاً من مسار عملك لا جزيرة منعزلة.',
              bullets: [
                'إرسال الرسائل عبر API',
                'نقاط نهاية لإرسال القوالب',
                'واجهات لإدارة جهات الاتصال والمحادثات',
                'تكامل سلس مع الـ CRM والتطبيقات والمواقع',
              ],
              image: '/uploads/landing/950x550.svg',
            },
          ],
        },
        pricing_section: {
          title: 'باقات تنمو مع نجاحك — لا تقيّد طموحك',
          badge: 'الباقات',
          description:
            'اختر ما يناسب مرحلتك اليوم، وارتقِ غداً بسهولة. أتمتة ورسائل عبر القنوات التي يختارها عميلك — لتقترب منه لا العكس.',
          subscribed_count: '45',
          subscribed_user: 'avatar',
          plans: [],
        },
        testimonials_section: {
          title: 'قصص من فرق اختارت أن تكون أقرب لعملائها',
          badge: 'آراء العملاء',
          testimonials: [],
        },
        faq_section: {
          title: 'أسئلة يطرحها الكثيرون قبل الانطلاق',
          faqs: [],
          badge: 'الأسئلة الشائعة',
        },
        contact_section: {
          title: 'نحن على بعد رسالة منك',
          subtitle: 'فريق يستمع، يجيب، ويرافقك في أول خطواتك على المنصّة',
          form_enabled: true,
          phone_no: '+91 9879878789',
          email: 'hello@botfeed.io',
        },
        footer_section: {
          cta_title: 'من حضور متفرّق على الشبكات — إلى آلة نمو منظّمة',
          cta_description:
            'حملات، أتمتة، ودعم يتجاوز الرد السريع إلى علاقة حقيقية — عبر القنوات الاجتماعية التي يفضّلها عميلك. منصة واحدة، ورسالة واضحة في كل مرة.',
          cta_buttons: [{ text: 'ابدأ تجربتك', link: '/signup' }],
          social_links: [
            {
              twitter: 'https://twitter.com/botfeedio',
              linkedin: 'https://linkedin.com/company/botfeed',
              facebook: 'https://facebook.com/botfeedio',
              instagram: 'https://instagram.com/botfeedio',
            },
          ],
          copy_rights_text: '© 2026 بوتفيد. جميع الحقوق محفوظة.',
        },
      });

      await landingPage.save();
    }

    const populatedLandingPage = await LandingPage.findById(landingPage._id)
      .populate({
        path: 'pricing_section.plans._id',
        select: '_id name price billing_cycle description features is_featured sort_order',
        populate: {
          path: 'currency taxes',
        }
      })
      .populate('testimonials_section.testimonials._id', '_id title description user_name user_post user_image status rating')
      .populate('faq_section.faqs._id', '_id title description status');

    const result = populatedLandingPage.toObject();

    // Auto-fill plans: if none are manually assigned, show all active plans
    const manualPlans = result.pricing_section?.plans || [];
    const hasPopulatedPlans = manualPlans.some(p => p._id && typeof p._id === 'object' && p._id.name);
    if (!hasPopulatedPlans) {
      const activePlans = await Plan.find({ is_active: true, deleted_at: null })
        .populate('currency taxes')
        .sort({ sort_order: 1, price: 1 })
        .lean();
      result.pricing_section = {
        ...(result.pricing_section || {}),
        plans: activePlans.map(p => ({ _id: p })),
      };
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting landing page:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving landing page',
      error: error.message
    });
  }
};

const updateLandingPage = async (req, res) => {
  try {
    const {
      hero_section,
      features_section,
      platform_section,
      pricing_section,
      testimonials_section,
      faq_section,
      contact_section,
      footer_section
    } = req.body;

    const updateData = {};

    if (hero_section) {
      updateData.hero_section = hero_section;
    }

    if (features_section) {
      updateData.features_section = features_section;
    }

    if (platform_section) {
      updateData.platform_section = platform_section;
    }

    if (pricing_section) {
      if (pricing_section.plans && Array.isArray(pricing_section.plans)) {
        updateData['pricing_section.plans'] = pricing_section.plans.map(plan => ({
          _id: plan._id || plan
        }));
      }

      if (pricing_section.title !== undefined) updateData['pricing_section.title'] = pricing_section.title;
      if (pricing_section.badge !== undefined) updateData['pricing_section.badge'] = pricing_section.badge;
      if (pricing_section.description !== undefined) updateData['pricing_section.description'] = pricing_section.description;
      if (pricing_section.subscribed_count !== undefined) updateData['pricing_section.subscribed_count'] = pricing_section.subscribed_count;
      if (pricing_section.subscribed_user !== undefined) updateData['pricing_section.subscribed_user'] = pricing_section.subscribed_user;
    }

    if (testimonials_section) {
      if (testimonials_section.testimonials && Array.isArray(testimonials_section.testimonials)) {
        updateData['testimonials_section.testimonials'] = testimonials_section.testimonials.map(testimonial => ({
          _id: testimonial._id || testimonial
        }));
      }

      if (testimonials_section.title !== undefined) updateData['testimonials_section.title'] = testimonials_section.title;
      if (testimonials_section.badge !== undefined) updateData['testimonials_section.badge'] = testimonials_section.badge;
    }

    if (faq_section) {
      if (faq_section.faqs && Array.isArray(faq_section.faqs)) {
        updateData['faq_section.faqs'] = faq_section.faqs.map(faq => ({
          _id: faq._id || faq
        }));
      }

      if (faq_section.title !== undefined) updateData['faq_section.title'] = faq_section.title;
      if (faq_section.badge !== undefined) updateData['faq_section.badge'] = faq_section.badge;
    }

    if (contact_section) {
      updateData.contact_section = contact_section;
    }

    if (footer_section) {
      updateData.footer_section = footer_section;
    }

    let landingPage = await LandingPage.findOne();

    if (!landingPage) {
      landingPage = new LandingPage(updateData);
      await landingPage.save();
    } else {
      await LandingPage.findByIdAndUpdate(landingPage._id, updateData, { new: true });
    }

    const updatedLandingPage = await LandingPage.findById(landingPage._id)
      .populate('pricing_section.plans._id', '_id name price features is_featured')
      .populate('testimonials_section.testimonials._id')
      .populate('faq_section.faqs._id');

    res.status(200).json({
      success: true,
      message: 'Landing page updated successfully',
      data: updatedLandingPage
    });
  } catch (error) {
    console.error('Error updating landing page:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating landing page',
      error: error.message
    });
  }
};

const uploadLandingImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl: `/uploads/landing/${req.file.filename}`
    });
  } catch (error) {
    console.error('Error uploading landing page image:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error.message
    });
  }
};

export {
  getLandingPage,
  updateLandingPage,
  uploadLandingImage
};

// FAQ questions and answers (from the KeyCraze Wix site).
// Each answer is a list of blocks: a paragraph, or a list with an optional heading.

export type Block = { p: string } | { list: string[]; title?: string; ordered?: boolean };

export interface Faq {
	q: string;
	a: Block[];
}

export const faqs: Faq[] = [
	{
		q: 'What is custom keyboard?',
		a: [
			{
				p: "A custom keyboard is a super cool input device that's built just the way you like it, fitting your taste in looks, functionality, and comfort. Unlike regular keyboards, it lets you customize almost everything—key switches, keycaps, layout, and even features like RGB lighting. At Keycraze, we're excited to help you create a keyboard that's totally you!"
			}
		]
	},
	{
		q: 'How can Keycraze help me create one?',
		a: [
			{
				p: 'Our enthusiastic team will happily assist you in picking out the perfect components and putting it all together, so you end up with a keyboard that\'s perfect for typing, gaming, or work. When you go with Keycraze, you\'re leaning on our deep passion and expertise for making top-notch, custom setups. We offer tons of resources, fun workshops, and personal consultations to bring your keyboard dreams to life. Let us show you just how amazing a custom keyboard can be with our friendly support!'
			}
		]
	},
	{
		q: "What's the difference between a stock and modded keyboard?",
		a: [
			{
				p: "A stock keyboard is how it comes straight from the factory—standard switches, stabilizers, and foam (if included). A modded keyboard, on the other hand, has been upgraded for better sound, feel, and performance. Mods can include lubed and filmed switches, tuned stabilizers, upgraded foam, gasket enhancements, tape mods, and case dampening to improve acoustics and typing feel. A well-modded keyboard provides a smoother, quieter, and more refined experience compared to stock."
			},
			{
				p: "If you're interested in custom mods for your keyboard, contact us at Keycraze, and we'll help you build your dream setup!"
			}
		]
	},
	{
		q: 'How do I choose the best keyboard for gaming, typing, or work?',
		a: [
			{ p: "At Keycraze, we know the right keyboard enhances your experience. Here's a quick guide:" },
			{
				title: 'For Gaming',
				list: [
					'Switch Type: Mechanical with fast, tactile switches.',
					'Key Rollover & Anti-Ghosting: Ensure N-key rollover and anti-ghosting.',
					'Backlighting: RGB for better visibility and personalization.'
				]
			},
			{
				title: 'For Typing',
				list: [
					'Switch Type: Mechanical with soft, tactile switches.',
					'Ergonomics: Wrist rests and ergonomic design.',
					'Key Layout: Standard or Tenkeyless, based on your need for a numeric keypad.'
				]
			},
			{
				title: 'For Work',
				list: [
					'Quiet Switches: Choose quieter mechanical switches.',
					'Connectivity: Wireless or Bluetooth for mobility.',
					'Function Keys: Programmable keys to streamline workflow.'
				]
			},
			{
				p: 'At Keycraze, we aim to craft your keyboard passion, one key at a time. Explore our collection for your perfect match.'
			}
		]
	},
	{
		q: 'Can you upgrade my keyboard with better foam or a custom case?',
		a: [
			{
				p: "Yes! At Keycraze, we offer keyboard upgrades, including better foam installation and custom case swaps. Adding high-quality foam (such as PCB, plate, or case foam) helps reduce hollow sounds and enhances acoustics, while a custom case can improve aesthetics, weight, and overall typing feel. Whether you're looking for a quieter, deeper sound profile or a complete visual overhaul, we can tailor the upgrade to your preference. Contact us at Keycraze for custom upgrade options!"
			}
		]
	},
	{
		q: 'How many type of switches for keyboard?',
		a: [
			{ p: 'There are three main types of keyboard switches:' },
			{
				ordered: true,
				list: [
					'Linear Switches – Smooth and consistent keystrokes with no tactile bump or audible click. Great for gaming due to their fast actuation.',
					'Tactile Switches – Provide a noticeable bump mid-press to indicate key activation without a loud click. Ideal for typists who want feedback without excessive noise.',
					'Clicky Switches – Feature a tactile bump with an audible "click" sound, giving both physical and auditory feedback. Perfect for those who love the classic mechanical keyboard feel.'
				]
			},
			{
				p: 'There are also specialty switches like silent switches, low-profile switches, and electro-capacitive switches. If you want to know more about switch types or need recommendations, please contact us at Keycraze!'
			}
		]
	},
	{
		q: 'Do you offer switch lubing and stabilizer tuning?',
		a: [
			{
				p: "Yes! At Keycraze, we provide professional switch lubing and stabilizer tuning services to enhance your keyboard's feel and sound. Lubing switches reduces friction, improves smoothness, and minimizes scratchiness, while stabilizer tuning eliminates rattle and ensures a more consistent keystroke. Whether you want a buttery-smooth typing experience or a finely tuned stabilizer setup, we've got you covered."
			},
			{
				p: 'If you have specific preferences for lube type, technique, or sound profile, feel free to contact us at Keycraze for custom requests!'
			}
		]
	},
	{
		q: 'What are some budget, mid, and high-end keyboards that you recommend for different types of users?',
		a: [
			{
				p: 'At Keycraze, we understand that different users have varying needs and budgets when it comes to keyboards. Ultimately, our goal is to help you find the perfect keyboard that fits your specific needs and enhances your typing or gaming experience. PLEASE CONTACT US FOR MORE INFORMATION. Happy typing!'
			}
		]
	},
	{
		q: 'What is the difference between a hotswap PCB and a solder PCB for custom keyboards?',
		a: [
			{
				p: "At Keycraze, we understand the nuances of customizing your perfect keyboard, and one of the key decisions you'll face is choosing between a hotswap PCB and a solder PCB. A hotswap PCB allows you to swap out switches without soldering, making it perfect for those who love to experiment with different switch types or want an easy, tool-free customization experience. Meanwhile, a solder PCB requires switches to be soldered in place, providing a more secure connection and potentially a more stable typing feel. However, swapping switches later requires desoldering and resoldering, which takes more effort. Both options cater to different needs—hotswap for convenience and flexibility, and solder for durability and custom layout possibilities—so consider what suits your build best!"
			}
		]
	}
];

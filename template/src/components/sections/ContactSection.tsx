import type { SectionProps } from "@/lib/types";
import { str } from "@/lib/types";

export function ContactSection({ block }: SectionProps) {
  const c = block.content;
  const title = str(c.title, "Contact Us");
  const description = str(c.description);
  const email = str(c.email);
  const phone = str(c.phone);
  const address = str(c.address);

  return (
    <div className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 data-cms-field="title" className="text-3xl font-bold text-center mb-4">
          {title}
        </h2>
        {description && (
          <p data-cms-field="description" className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
            {description}
          </p>
        )}
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-4">
            {email && (
              <p data-cms-field="email">
                <span className="font-medium">Email:</span>{" "}
                <a href={`mailto:${email}`} className="text-blue-600 hover:underline">
                  {email}
                </a>
              </p>
            )}
            {phone && (
              <p data-cms-field="phone">
                <span className="font-medium">Phone:</span>{" "}
                <a href={`tel:${phone}`} className="text-blue-600 hover:underline">
                  {phone}
                </a>
              </p>
            )}
            {address && (
              <p data-cms-field="address">
                <span className="font-medium">Address:</span> {address}
              </p>
            )}
          </div>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              placeholder="Your Name"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
            <input
              type="email"
              placeholder="Your Email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
            <textarea
              rows={4}
              placeholder="Your Message"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

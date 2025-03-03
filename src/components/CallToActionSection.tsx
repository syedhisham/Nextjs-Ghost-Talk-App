import React from 'react'

const CallToActionSection = () => {
  return (
    <div>
      <section className="mt-16 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold">Start Chatting Now!</h2>
          <p className="mt-4 text-gray-600 text-lg">
            Join the anonymous community and experience the excitement of secret conversations.
          </p>
          <button className="mt-6 px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md 
            hover:bg-blue-700 transition">
            Start Now
          </button>
        </section>
    </div>
  )
}

export default CallToActionSection

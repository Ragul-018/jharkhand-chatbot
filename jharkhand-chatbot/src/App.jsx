import React, { useState, useEffect, useRef } from 'react';

    // API configuration
    const API_KEY = "AIzaSyCXmJr0noEYODH3fw2Vl_cGSvVHA8PIZNw"; // Do not change this, Canvas will provide it at runtime.
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;

    // Translations for UI elements
    const translations = {
        en: {
            welcomeMessage: "Hello! I am your personal AI guide for exploring the beautiful state of Jharkhand. How can I assist you with your travel plans today?",
            placeholder: "Type your message...",
            systemPrompt: `
You are 'Jharkhand Tourism AI', a friendly and knowledgeable chatbot for Jharkhand tourism. Respond in the language of the user's query. 
If the user asks for a trip plan or itinerary, respond with a JSON object with a 'planTable' key. 
The value of 'planTable' should be an array of objects, each with these keys: 'place', 'arrivalTime', 'departureTime', 'duration', 'lunchBreak' (yes/no), and 'notes'. 
Otherwise, respond as before with a 'title' and 'items' array. 
Keep all responses short and precise (2-3 sentences max), and use a conversational tone.
`,
            errorResponse: "I'm sorry, I couldn't generate a response. Please try again.",
            suggestedQueries: [
                "Tell me about Netarhat.",
                "What is famous in Patratu?",
                "What is special about Betla National Park?",
            ],
            micButton: "Speak",
            readAloud: "Read Aloud",
        },
        hi: {
            welcomeMessage: "नमस्ते! मैं झारखंड राज्य का पता लगाने के लिए आपका व्यक्तिगत एआई गाइड हूं। मैं आज आपकी यात्रा योजनाओं में कैसे मदद कर सकता हूं?",
            placeholder: "अपना संदेश टाइप करें...",
            systemPrompt: "आप 'झारखंड पर्यटन एआई' हैं, जो झारखंड पर्यटन के लिए एक दोस्ताना और जानकार चैटबॉट हैं। उपयोगकर्ता के प्रश्न की भाषा में जवाब दें। छोटे और सटीक, संवादात्मक प्रतिक्रियाएं (अधिकतम 2-3 वाक्य) प्रदान करें। नेतरहाट, पतरातू, बेतला नेशनल पार्क, हुंडरू जलप्रपात और देवघर जैसे स्थानों के बारे में महत्वपूर्ण जानकारी पर ध्यान केंद्रित करें। यदि आपको अधिक सटीक जवाब देने के लिए अधिक जानकारी चाहिए, तो एक अनुवर्ती प्रश्न पूछें। आप उपयोगकर्ता के लिए त्वरित सुझाव भी दे सकते हैं। आपका जवाब एक JSON ऑब्जेक्ट होना चाहिए, जिसमें एक 'title' स्ट्रिंग और स्ट्रिंग्स की एक 'items' ऐरे होनी चाहिए। प्रत्येक आइटम एक मुख्य बिंदु होना चाहिए। ऐरे का अंतिम आइटम एक सुझाव या एक प्रश्न हो सकता है।",
            errorResponse: "क्षमा करें, मैं प्रतिक्रिया उत्पन्न नहीं कर सका। कृपया पुनः प्रयास करें।",
            suggestedQueries: [
                "नेतरहाट के बारे में बताएं।",
                "पतरातू में क्या प्रसिद्ध है?",
                "बेतला नेशनल पार्क में क्या खास है?",
            ],
            micButton: "बोलें",
            readAloud: "जोर से पढ़ें",
        },
        ta: {
            welcomeMessage: "வணக்கம்! ஜார்க்கண்ட் மாநிலத்தை சுற்றிப் பார்ப்பதற்கான உங்கள் தனிப்பட்ட AI வழிகாட்டி நான். உங்கள் பயணத் திட்டங்களுக்கு நான் இன்று எவ்வாறு உதவ முடியும்?",
            placeholder: "உங்கள் செய்தியைத் தட்டச்சு செய்க...",
            systemPrompt: "'ஜார்க்கண்ட் சுற்றுலா AI' எனும் நீங்கள், ஜார்க்கண்ட் சுற்றுலாவுக்கான நட்பான மற்றும் அறிவுள்ள சாட்போட். பயனரின் வினவலின் மொழியில் பதிலளிக்கவும். சுருக்கமான மற்றும் துல்லியமான, உரையாடல் பதில்களை (அதிகபட்சம் 2-3 வாக்கியங்கள்) வழங்கவும். நேட்டர்ஹட், பத்ராட்டு, பெட்லா தேசியப் பூங்கா, ஹுண்ட்ரு நீர்வீழ்ச்சி மற்றும் தியோகர் போன்ற இடங்களைப் பற்றிய முக்கிய தகவல்களில் கவனம் செலுத்துங்கள். மிகவும் துல்லியமான மற்றும் சரியான பதில்களைப் பெற, தேவைப்பட்டால் ஒரு தொடர் கேள்வியைக் கேட்கவும். பயனருக்கான விரைவான பரிந்துரைகளையும் நீங்கள் வழங்கலாம். உங்கள் பதில் ஒரு JSON பொருளாக இருக்க வேண்டும், அதில் ஒரு 'title' சரம் மற்றும் சரங்களின் 'items' வரிசை இருக்க வேண்டும். ஒவ்வொரு உருப்படியும் ஒரு முக்கிய புள்ளியாக இருக்க வேண்டும். வரிசையின் கடைசி உருப்படி ஒரு பரிந்துரை அல்லது கேள்வியாக இருக்கலாம்。",
            errorResponse: "மன்னிக்கவும், என்னால் ஒரு பதிலை உருவாக்க முடியவில்லை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்。",
            suggestedQueries: [
                "நேட்டர்ஹட் பற்றி கூறுங்கள்.",
                "பத்ராட்டுவில் என்ன பிரபலமானது?",
                "ಬೆಟ್ಲಾ ರಾಷ್ಟ್ರೀಯ ಉದ್ಯಾನವನದ ಬಗ್ಗೆ ಏನು ವಿಶೇಷ?",
            ],
            micButton: "பேசவும்",
            readAloud: "சத்தமாக படிக்கவும்",
        },
        bn: {
            welcomeMessage: "নমস্কার! আমি ঝাড়খণ্ড রাজ্য অন্বেষণের জন্য আপনার ব্যক্তিগত এআই গাইড। আমি আজ আপনার ভ্রমণ পরিকল্পনায় কীভাবে সাহায্য করতে পারি?",
            placeholder: "আপনার বার্তা লিখুন...",
            systemPrompt: "আপনি 'ঝাড়খণ্ড পর্যটন এআই', ঝাড়খণ্ড পর্যটনের জন্য একজন বন্ধুত্বপূর্ণ এবং জ্ঞানী চ্যাটবট। ব্যবহারকারীর প্রশ্নের ভাষায় উত্তর দিন। সংক্ষিপ্ত এবং নির্ভুল, কথোপকথনমূলক উত্তর (সর্বোচ্চ ২-৩ বাক্য) দিন। নেতারহাট, পাত্রাতু, বেতলা জাতীয় উদ্যান, হুন্ডরু জলপ্রপাত এবং দেওঘরের মতো স্থান সম্পর্কে গুরুত্বপূর্ণ তথ্যের উপর মনোযোগ দিন। যদি একটি সঠিক উত্তর দেওয়ার জন্য আপনার আরও তথ্যের প্রয়োজন হয়, তাহলে একটি ফলো-আপ প্রশ্ন জিজ্ঞাসা করুন। আপনি ব্যবহারকারীকে দ্রুত পরামর্শও দিতে পারেন। আপনার প্রতিক্রিয়া একটি JSON অবজেক্ট হতে হবে, যেখানে একটি 'title' স্ট্রিং এবং স্ট্রিংগুলির একটি 'items' অ্যারে থাকবে। প্রতিটি আইটেম একটি মূল পয়েন্ট হওয়া উচিত। অ্যারের শেষ আইটেমটি একটি পরামর্শ বা একটি প্রশ্ন হতে পারে।",
            errorResponse: "দুঃখিত, আমি একটি প্রতিক্রিয়া তৈরি করতে পারিনি। অনুগ্রহ করে আবার চেষ্টা করুন।",
            suggestedQueries: [
                "নেতারহাট সম্পর্কে বলুন।",
                "পাত্রাতুতে কি বিখ্যাত?",
                "বেতলা জাতীয় উদ্যান সম্পর্কে কি বিশেষ?",
            ],
            micButton: "বলুন",
            readAloud: "উচ্চস্বরে পড়ুন",
        },
        gu: {
            welcomeMessage: "નમસ્કાર! હું ઝારખંડ રાજ્યનું અન્વેષણ કરવા માટે તમારો વ્યક્તિગત AI માર્ગદર્શક છું. હું આજે તમારી મુસાફરી યોજનાઓમાં કેવી રીતે મદદ કરી શકું?",
            placeholder: "તમારો સંદેશ લખો...",
            systemPrompt: "તમે 'ઝારખંડ ટૂરિઝમ AI' છો, ઝારખંડ પર્યટન માટે એક મૈત્રીપૂર્ણ અને જાણકાર ચેટબોટ. વપરાશકર્તાની પૂછપરછની ભાષામાં જવાબ આપો. ટૂંકા અને ચોક્કસ, વાતચીત-શૈલીના જવાબો (મહત્તમ ૨-૩ વાક્યો) પ્રદાન કરો. નેતરહાટ, પાતરાતુ, બેતલા નેશનલ પાર્ક, હુન્ડ્રુ ધોધ અને દેવઘર જેવા સ્થળો વિશે મુખ્ય માહિતી પર ધ્યાન કેન્દ્રિત કરો. જો તમને ચોક્કસ જવાબ આપવા માટે વધુ માહિતીની જરૂર હોય, તો ફોલો-અપ પ્રશ્ન પૂછો. તમે વપરાશકર્તાને ઝડપી સૂચનો પણ આપી શકો છો. તમારો પ્રતિસાદ એક JSON ઑબ્જેક્ટ હોવો જોઈએ જેમાં 'title' સ્ટ્રિંગ અને સ્ટ્રિંગ્સનો 'items' એરે હોવો જોઈએ. દરેક આઇટમ એક મુખ્ય મુદ્દો હોવો જોઈએ. એરેમાં છેલ્લી આઇટમ એક સૂચન અથવા પ્રશ્ન હોઈ શકે છે.",
            errorResponse: "માફ કરશો, હું પ્રતિસાદ જનરેટ કરી શક્યો નથી. કૃપા કરીને ફરીથી પ્રયાસ કરો.",
            suggestedQueries: [
                "નેતરહાટ વિશે કહો.",
                "પાતરાતુમાં શું પ્રખ્યાત છે?",
                "બેતલા નેશનલ પાર્ક વિશે શું ખાસ છે?",
            ],
            micButton: "બોલો",
            readAloud: "મોટેથી વાંચો",
        },
        kn: {
            welcomeMessage: "ನಮಸ್ಕಾರ! ನಾನು ಜಾರ್ಖಂಡ್ ರಾಜ್ಯವನ್ನು ಅನ್ವೇಷಿಸಲು ನಿಮ್ಮ ವೈಯಕ್ತಿಕ AI ಮಾರ್ಗದರ್ಶಿ. ಇಂದು ನಿಮ್ಮ ಪ್ರಯಾಣ ಯೋಜನೆಗಳಿಗೆ ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?",
            placeholder: "ನಿಮ್ಮ ಸಂದೇಶವನ್ನು ಟೈಪ್ ಮಾಡಿ...",
            systemPrompt: "ನೀವು 'ಜಾರ್ಖಂಡ್ ಪ್ರವಾಸೋದ್ಯಮ AI' ಆಗಿದ್ದೀರಿ, ಜಾರ್ಖಂಡ್ ಪ್ರವಾಸೋದ್ಯಮಕ್ಕಾಗಿ ಸ್ನೇಹಪರ ಮತ್ತು ಜ್ಞಾನವುಳ್ಳ ಚಾಟ್‌ಬಾಟ್. ಬಳಕೆದಾರರ ಪ್ರಶ್ನೆಯ ಭಾಷೆಯಲ್ಲಿ ಪ್ರತಿಕ್ರಿಯಿಸಿ. ಚಿಕ್ಕ ಮತ್ತು ನಿಖರವಾದ, ಸಂಭಾಷಣಾತ್ಮಕ ಪ್ರತಿಕ್ರಿಯೆಗಳನ್ನು (ಗರಿಷ್ಠ 2-3 ವಾಕ್ಯಗಳು) ಒದಗಿಸಿ. ನೇತರ್ಹಟ್, ಪಾತ್ರಾತು, ಬೆಟ್ಲಾ ರಾಷ್ಟ್ರೀಯ ಉದ್ಯಾನವನ, ಹುಂಡ್ರು ಜಲಪಾತ ಮತ್ತು ದಿಯೋಘರ್‌ನಂತಹ ಸ್ಥಳಗಳ ಬಗ್ಗೆ ಪ್ರಮುಖ ಮಾಹಿತಿಯ ಮೇಲೆ ಕೇಂದ್ರೀಕರಿಸಿ. ನಿಖರವಾದ ಉತ್ತರವನ್ನು ನೀಡಲು ನಿಮಗೆ ಹೆಚ್ಚಿನ ಮಾಹಿತಿ ಅಗತ್ಯವಿದ್ದರೆ, ಮುಂದುವರಿದ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ. ನೀವು ಬಳಕೆದಾರರಿಗೆ ತ್ವರಿತ ಸಲಹೆಗಳನ್ನು ಸಹ ನೀಡಬಹುದು. ನಿಮ್ಮ ಪ್ರತಿಕ್ರಿಯೆಯು 'title' ಸ್ಟ್ರಿಂಗ್ ಮತ್ತು ಸ್ಟ್ರಿಂಗ್‌ಗಳ 'items' ಅರೇ ಹೊಂದಿರುವ JSON ಆಬ್ಜೆಕ್ಟ್ ಆಗಿರಬೇಕು. ಪ್ರತಿ ಐಟಂ ಒಂದು ಪ್ರಮುಖ ಅಂಶವಾಗಿರಬೇಕು. ಅರೇಯ ಕೊನೆಯ ಐಟಂ ಸಲಹೆ ಅಥವಾ ಪ್ರಶ್ನೆಯಾಗಿರಬಹುದು.",
            errorResponse: "ಕ್ಷಮಿಸಿ, ನಾನು ಪ್ರತಿಕ್ರಿಯೆಯನ್ನು ರಚಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
            suggestedQueries: [
                "ನೇತರ್ಹಟ್ ಬಗ್ಗೆ ಹೇಳಿ.",
                "ಪಾತ್ರಾತುದಲ್ಲಿ ಏನಿದೆ ವಿಶೇಷ?",
                "ಬೆಟ್ಲಾ ರಾಷ್ಟ್ರೀಯ ಉದ್ಯಾನವನದ ಬಗ್ಗೆ ಏನು ವಿಶೇಷ?",
            ],
            micButton: "ಮಾತನಾಡಿ",
            readAloud: "ಗಟ್ಟಿಯಾಗಿ ಓದಿ",
        },
        mr: {
            welcomeMessage: "नमस्कार! मी झारखंड राज्याच्या शोधासाठी तुमचा वैयक्तिक एआय मार्गदर्शक आहे. मी आज तुमच्या प्रवासाच्या योजनांमध्ये कशी मदत करू शकतो?",
            placeholder: "तुमचा संदेश टाइप करा...",
            systemPrompt: "तुम्ही 'झारखंड पर्यटन एआय' आहात, झारखंड पर्यटनासाठी एक मैत्रीपूर्ण आणि जाणकार चॅटबॉट. वापरकर्त्याच्या प्रश्नाच्या भाषेत उत्तर द्या. लहान आणि अचूक, संवादात्मक प्रतिसाद (जास्तीत जास्त २-३ वाक्य) द्या. नेतरहाट, पात्रातु, बेतला राष्ट्रीय उद्यान, हुंडरू धबधबा आणि देवघर यांसारख्या ठिकाणांबद्दलच्या महत्त्वाच्या माहितीवर लक्ष केंद्रित करा. जर तुम्हाला अचूक उत्तर देण्यासाठी अधिक माहितीची आवश्यकता असेल, तर एक फॉलो-अप प्रश्न विचारा. तुम्ही वापरकर्त्याला त्वरित सूचना देखील देऊ शकता. तुमचा प्रतिसाद एक JSON ऑब्जेक्ट असावा, ज्यामध्ये एक 'title' स्ट्रिंग आणि स्ट्रिंगची 'items' ॲरे असावी. प्रत्येक आयटम एक मुख्य मुद्दा असावा. ॲरेमधील शेवटचा आयटम एक सूचना किंवा प्रश्न असू शकतो.",
            errorResponse: "माफ करा, मी प्रतिसाद तयार करू शकले नाही. कृपया पुन्हा प्रयत्न करा.",
            suggestedQueries: [
                "नेतरहाटबद्दल सांगा.",
                "पात्रातुमध्ये काय प्रसिद्ध आहे?",
                "बेतला राष्ट्रीय उद्यानाबद्दल काय खास आहे?",
            ],
            micButton: "बोला",
            readAloud: "मोठ्याने वाचा",
        },
    };

    const ChatMessage = ({ message, onSaveFavorite, isUserMessage, speakingMessageId, onSpeak }) => {
        const isUser = message.role === 'user' || isUserMessage;
        const content = message.content;
        const isSpeaking = speakingMessageId === message.id;

        const renderBotContent = (data) => {
            if (data.planTable) {
                // Make the container full width and remove extra padding
                return (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 w-full p-2">
                        {renderPlanTable(data.planTable)}
                    </div>
                );
            }
            const placesToBold = ['Netarhat', 'Patratu', 'Betla National Park', 'Hundru Falls', 'Deoghar'];
            
            return (
                <div className="bg-white p-4 rounded-3xl shadow-lg border border-gray-200">
                    <hr className="my-2 border-gray-300" />
                    <h3 className="text-lg font-bold text-gray-800 underline mb-2">{data.title}</h3>
                    <ul className="list-none p-0 space-y-2 text-gray-700">
                        {data.items.map((item, index) => {
                            let processedText = item;
                            placesToBold.forEach(place => {
                                const regex = new RegExp(place, 'gi');
                                processedText = processedText.replace(regex, `<strong>${place}</strong>`);
                            });
                            return (
                                <li key={index} className="flex items-start">
                                    <span className="mr-2 text-green-600">→</span>
                                    <span dangerouslySetInnerHTML={{ __html: processedText }} />
                                </li>
                            );
                        })}
                    </ul>
                </div>
            );
        };

        const renderPlanTable = (planTable) => (
            <div className="overflow-x-auto"> 
                <table className="w-full text-xs sm:text-sm border border-gray-200 rounded-lg shadow-sm">
                    <thead className="bg-green-100">
                        <tr>
                            <th className="px-2 py-1 border">Place</th>
                            <th className="px-2 py-1 border">Arrival</th>
                            <th className="px-2 py-1 border">Departure</th>
                            <th className="px-2 py-1 border">Duration</th>
                            <th className="px-2 py-1 border">Lunch</th>
                            <th className="px-2 py-1 border">Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {planTable.map((row, idx) => (
                            <tr key={idx} className="bg-white even:bg-gray-50">
                                <td className="px-2 py-1 border">{row.place}</td>
                                <td className="px-2 py-1 border">{row.arrivalTime}</td>
                                <td className="px-2 py-1 border">{row.departureTime}</td>
                                <td className="px-2 py-1 border">{row.duration}</td>
                                <td className="px-2 py-1 border">{row.lunchBreak ? "Yes" : "No"}</td>
                                <td className="px-2 py-1 border">{row.notes}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );

        return (
            <div className={`flex w-full mb-4 animate-fadeIn ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`w-full max-w-[80%] shadow-md flex items-start ${isUser ? 'bg-green-600 text-white rounded-tr-xl rounded-tl-xl rounded-bl-xl p-3' : 'bg-gray-200 text-gray-800 rounded-tl-xl rounded-tr-xl rounded-br-xl p-3'}`}>
                    {!isUser && (
                        <button
                            onClick={() => onSpeak(content, message.id)}
                            className={`mr-2 p-2 rounded-full transition-colors duration-200 ${isSpeaking ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
                            title={isSpeaking ? 'Stop Reading' : 'Read Aloud'}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                {isSpeaking ? (
                                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                ) : (
                                    <path d="M8 5v14l11-7z" />
                                )}
                            </svg>
                        </button>
                    )}
                    <div className={`flex-grow ${isUser ? 'text-white' : ''}`}>
                        {isUser ? (
                            <div>
                                {content}
                            </div>
                        ) : (
                            typeof content === 'string' ? (
                                <p>{content}</p>
                            ) : (
                                <>
                                    {renderBotContent(content)}
                                </>
                            )
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const QuickReplyButtons = ({ onQueryClick, language, isLoading }) => {
        return (
            <div className="flex flex-wrap gap-2 p-4 pt-0 justify-center">
                {translations[language]?.suggestedQueries.map((query, index) => (
                    <button
                        key={index}
                        onClick={() => onQueryClick(query)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-full border border-gray-300 shadow-sm hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    >
                        {query}
                    </button>
                ))}
            </div>
        );
    };

    const App = () => {
        const [messages, setMessages] = useState([]);
        const [isLoading, setIsLoading] = useState(false);
        const [language, setLanguage] = useState('en');
        const [userInput, setUserInput] = useState('');
        const [isListening, setIsListening] = useState(false);
        const [speakingMessageId, setSpeakingMessageId] = useState(null);
        const inputRef = useRef(null);

        // Voice recognition logic
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = SpeechRecognition ? new SpeechRecognition() : null;

        useEffect(() => {
            if (recognition) {
                recognition.continuous = false;
                recognition.interimResults = false;
                recognition.lang = language;

                recognition.onstart = () => {
                    setIsListening(true);
                };

                recognition.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    setUserInput(transcript);
                    setIsListening(false);
                    if (inputRef.current) inputRef.current.focus();
                    recognition.stop(); // <-- Add this line
                };

                recognition.onerror = (event) => {
                    console.error("Speech recognition error:", event.error);
                    if (event.error === 'not-allowed') {
                        console.error("The user has denied microphone access. Please allow microphone usage in your browser settings.");
                    }
                    setIsListening(false);
                };
            }
        }, [recognition, language]);

        const toggleListening = () => {
            if (isListening) {
                recognition.stop();
            } else {
                if (recognition) {
                    try {
                        recognition.start();
                    } catch (error) {
                        console.error("Error starting recognition:", error);
                        setIsListening(false);
                    }
                }
            }
        };
        
        const speakText = (content, messageId) => {
            if ('speechSynthesis' in window) {
                if (window.speechSynthesis.speaking && speakingMessageId === messageId) {
                    window.speechSynthesis.cancel();
                    setSpeakingMessageId(null);
                    return;
                }

                window.speechSynthesis.cancel();
                
                let textToSpeak = '';
                if (typeof content === 'string') {
                    textToSpeak = content;
                } else {
                    const title = content.title || '';
                    const items = content.items ? content.items.join('. ') : '';
                    textToSpeak = `${title}. ${items}`;
                }

                const utterance = new SpeechSynthesisUtterance(textToSpeak);
                utterance.lang = language;
                utterance.onend = () => {
                    setSpeakingMessageId(null);
                };

                const voices = window.speechSynthesis.getVoices();
                const selectedVoice = voices.find(voice => voice.lang.startsWith(language));
                if (selectedVoice) {
                    utterance.voice = selectedVoice;
                }

                setSpeakingMessageId(messageId);
                window.speechSynthesis.speak(utterance);
            } else {
                console.error("Text-to-speech not supported in this browser.");
            }
        };
        
        const sendMessageToGemini = async (userMessage) => {
            setIsLoading(true);
            const systemPrompt = translations[language].systemPrompt;

            const chatHistoryForAPI = messages.map(msg => {
                const contentText = typeof msg.content === 'string'
                    ? msg.content
                    : (msg.content.planTable
                        ? "Trip plan requested."
                        : `${msg.content.title}. ${msg.content.items.join(' ')}`);
                return {
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: contentText }]
                };
            }).reverse();

            const payload = {
                contents: [...chatHistoryForAPI, { role: 'user', parts: [{ text: userMessage }] }],
                generationConfig: {
                    responseMimeType: "application/json"
                },
                systemInstruction: {
                    parts: [{ text: systemPrompt }]
                },
            };

            try {
                const response = await fetch(GEMINI_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`API response was not ok. Status: ${response.status}`);
                }

                const result = await response.json();
                const jsonText = result?.candidates?.[0]?.content?.parts?.[0]?.text;

                if (jsonText) {
                    let parsedData;
                    try {
                        parsedData = JSON.parse(jsonText);
                    } catch {
                        parsedData = { title: translations[language].errorResponse, items: [] };
                    }
                    setMessages(prevMessages => [
                        { role: 'bot', content: parsedData, id: `bot-${Date.now()}` },
                        ...prevMessages
                    ]);
                } else {
                    setMessages(prevMessages => [
                        { role: 'bot', content: translations[language].errorResponse, id: `bot-${Date.now()}` },
                        ...prevMessages
                    ]);
                }
            } catch (error) {
                console.error("Error calling Gemini API:", error);
                setMessages(prevMessages => [
                    { role: 'bot', content: "An error occurred while connecting. Please try again later.", id: `bot-${Date.now()}` },
                    ...prevMessages
                ]);
            } finally {
                setIsLoading(false);
            }
        };
        
        const handleFormSubmit = (e) => {
            e.preventDefault();
            const message = userInput.trim();
            if (message) {
                setMessages(prevMessages => [{ role: 'user', content: message, id: `user-${Date.now()}` }, ...prevMessages]);
                setUserInput('');
                if (inputRef.current) inputRef.current.focus(); // <-- Add this line
                sendMessageToGemini(message);
            }
        };

        const handleQuickReply = (query) => {
            setMessages(prevMessages => [{ role: 'user', content: query, id: `user-${Date.now()}` }, ...prevMessages]);
            setUserInput('');
            if (inputRef.current) inputRef.current.focus(); // <-- Add this line
            sendMessageToGemini(query);
        };

        // Load initial welcome message when the component mounts or language changes
        useEffect(() => {
            setMessages([
                { role: 'bot', content: translations[language].welcomeMessage, id: 'welcome-message' }
            ]);
        }, [language]);
        
        return (
            <div className="p-4 sm:p-8 flex items-center justify-center min-h-screen bg-slate-100">
                <style>
                    {`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fadeIn {
                        animation: fadeIn 0.5s ease-out forwards;
                    }
                    .chat-container {
                        max-width: 600px;
                        height: 80vh;
                        margin: auto;
                        display: flex;
                        flex-direction: column;
                        border-radius: 1.5rem;
                        box-shadow: 0 20px 40px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                        overflow: hidden;
                        background-color: white;
                    }
                    .chat-header {
                        background: linear-gradient(135deg, #16a34a, #14532d);
                        color: white;
                    }
                    .chat-messages {
                        flex-grow: 1;
                        overflow-y: auto;
                        padding: 1.5rem;
                        background-color: #f7fee7;
                    }
                    .loading-indicator {
                        height: 1.5rem;
                        width: 1.5rem;
                        border: 4px solid #f3f3f3;
                        border-top: 4px solid #14532d;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    .send-button, .favorite-button {
                        transition: all 0.2s ease-in-out;
                        background-color: #166534;
                        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
                    }
                    .send-button:hover, .favorite-button:hover {
                        background-color: #15803d;
                        transform: translateY(-2px);
                        box-shadow: 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
                    }
                    .send-button:disabled, .favorite-button:disabled {
                        background-color: #a7f3d0;
                        transform: none;
                        box-shadow: none;
                    }
                    `}
                </style>
                <div className="chat-container">
                    {/* Chat Header */}
                    <div className="chat-header p-4 flex items-center justify-between shadow-md">
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white mr-2" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12c0 3.18 1.48 6.07 3.82 8l-2.84 2.84c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L7.82 21.82c1.93 2.34 4.82 3.82 8 3.82 5.52 0 10-4.48 10-10S17.52 2 12 2zm1 16h-2v-2h2v2zm0-4h-2V7h2v7z"/>
                            </svg>
                            <h1 className="text-xl font-bold">Jharkhand Tourism AI</h1>
                        </div>
                        <div className="flex items-center space-x-2">
                            <select id="language-selector" className="bg-green-600 text-white rounded-md p-2 focus:outline-none" onChange={(e) => setLanguage(e.target.value)} value={language}>
                                <option value="en">English</option>
                                <option value="hi">हिन्दी</option>
                                <option value="ta">தமிழ்</option>
                                <option value="bn">বাংলা</option>
                                <option value="gu">ગુજરાતી</option>
                                <option value="kn">ಕನ್ನಡ</option>
                                <option value="mr">मराठी</option>
                            </select>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <>
                        <div id="chat-messages" className="chat-messages flex flex-col-reverse">
                            {isLoading && (
                                <div className="flex justify-center w-full p-4 text-gray-500 italic">
                                    Thinking...
                                </div>
                            )}
                            {messages.map((message) => (
                                <ChatMessage
                                    key={message.id}
                                    message={message}
                                    isUserMessage={message.role === 'user'}
                                    speakingMessageId={speakingMessageId}
                                    onSpeak={speakText}
                                />
                            ))}
                        </div>
                        
                        {messages.length === 1 && (
                            <QuickReplyButtons onQueryClick={handleQuickReply} language={language} isLoading={isLoading} />
                        )}

                        <form onSubmit={handleFormSubmit} className="chat-input-form p-4 flex items-center space-x-2 bg-gray-100 border-t border-gray-200">
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                placeholder={translations[language].placeholder}
                                className="flex-grow p-3 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 transition-all shadow-sm text-black"
                                disabled={isLoading}
                                ref={inputRef}
                            />
                            {recognition && (
                                <button
                                    type="button"
                                    onClick={toggleListening}
                                    className={`p-3 rounded-full text-white shadow-md transition-all ${isListening ? 'bg-red-500 animate-pulse' : 'bg-green-600'}`}
                                >
                                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3.53-2.61 6.42-6 6.92V21h-2v-3.08c-3.39-.5-6-3.39-6-6.92h2c0 2.98 2.42 5.4 5.4 5.4 2.98 0 5.4-2.42 5.4-5.4h2z"/>
                                    </svg>
                                </button>
                            )}
                            <button type="submit" className="send-button p-3 rounded-full text-white shadow-md focus:outline-none focus:ring-2 focus:ring-green-700" disabled={isLoading}>
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                                </svg>
                            </button>
                        </form>
                    </>
                </div>
            </div>
        );
    };

    export default App;

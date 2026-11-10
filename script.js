// التحقق مما إذا كان هناك حساب مسجل مسبقاً أم لا
document.addEventListener("DOMContentLoaded", () => {
    const savedPin = localStorage.getItem("user_pin");
    const savedName = localStorage.getItem("user_name");

    const pinSection = document.getElementById("pin-login-section"); 
    const registerSection = document.getElementById("register-section"); 

    if (!savedPin) {
        // إذا لم يكن هناك رمز مخزن، فهذه أول مرة يفتح فيها المستخدم التطبيق
        if (pinSection) pinSection.style.display = "none";
        if (registerSection) registerSection.style.display = "block";
    } else {
        // إذا كان هناك حساب قديم، يتم إظهار شاشة تسجيل الدخول المعتادة
        if (registerSection) registerSection.style.display = "none";
        if (pinSection) pinSection.style.display = "block";
    }
});

// دالة إنشاء الحساب الجديد
function createNewAccount(userName, userPin) {
    if (!userName || userPin.length !== 4) {
        alert("يرجى إدخال الاسم ورمز PIN مكون من 4 أرقام بشكل صحيح.");
        return;
    }

    localStorage.setItem("user_name", userName);
    localStorage.setItem("user_pin", userPin);

    alert("تم إنشاء الحساب بنجاح!");
    location.reload(); 
}

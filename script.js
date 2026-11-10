// التحقق مما إذا كان هناك حساب مسجل مسبقاً أم لا
document.addEventListener("DOMContentLoaded", () => {
    const savedPin = localStorage.getItem("user_pin");
    const savedName = localStorage.getItem("user_name");

    const pinSection = document.getElementById("pin-login-section"); // قسم شاشة إدخال الرمز
    const registerSection = document.getElementById("register-section"); // قسم إنشاء حساب جديد

    if (!savedPin) {
        // إذا لم يكن هناك رمز مخزن مسبقاً، فهذه أول مرة يفتح فيها المستخدم التطبيق
        if (pinSection) pinSection.style.display = "none";
        if (registerSection) registerSection.style.display = "block";
    } else {
        // إذا كان هناك حساب قديم، يتم إظهار شاشة تسجيل الدخول المعتادة
        if (registerSection) registerSection.style.display = "none";
        if (pinSection) pinSection.style.display = "block";
    }
});

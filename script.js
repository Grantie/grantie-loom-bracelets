import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase, set, ref, onValue, get } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";
const firebaseConfig = {
    apiKey: "AIzaSyDNaGsZMFMAeVIaDeYWgGrAK7MIzlQTh6M",
    authDomain: "grantie-loom-bracelets.firebaseapp.com",
    databaseURL: "https://grantie-loom-bracelets-default-rtdb.firebaseio.com",
    projectId: "grantie-loom-bracelets",
    storageBucket: "grantie-loom-bracelets.appspot.com",
    messagingSenderId: "829129718515",
    appId: "1:829129718515:web:5ebec32a404fe56231d586"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

document.querySelector("#submitOrder").addEventListener("click", (e) => {
    var studentID = document.querySelector("#studentID").value;
    var type = document.querySelector("#type").value;
    var colors = document.querySelector("#colors").value;

    if (studentID === "" || studentID == null || type === "" || type == null || colors === "" || colors == null) {
        return Swal.fire({
            icon: "error",
            title: "Error",
            text: "Please fill out all of the fields.",
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 10000,
            timerProgressBar: true,
        });
    }

    get(ref(db, `students/${studentID}`)).then((student) => {
        if (student.val() == null) {
            return Swal.fire({
                icon: "error",
                title: "Error",
                text: "That student ID is not valid or you are not allowed. If you are a student in room 55, please contact Grant to fix this issue.",
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 10000,
                timerProgressBar: true,
            });
        } else {
            Swal.fire({
                title: "Is this you?",
                text: student.val(),
                showConfirmButton: true,
                confirmButtonText: "Yes",
                showDenyButton: true,
                denyButtonText: "No",
                allowOutsideClick: false,
            }).then((result) => {
                if (result.isConfirmed) {
                    get(ref(db, `products/${type}`)).then((product) => {
                        if (product.val() == null) {
                            return Swal.fire({
                                icon: "error",
                                title: "Error",
                                text: "Unknown product. Please contact Grant.",
                                toast: true,
                                position: "top-end",
                                showConfirmButton: false,
                                timer: 10000,
                                timerProgressBar: true,
                            });
                        } else {
                            Swal.fire({
                                icon: "warning",
                                title: "Confirm Price",
                                text: `On the next day of school, please bring $${product.val()} to school to give to Grant. Grant will give you your product when available.`,
                                footer: `TOTAL PRICE: $${product.val()}`,
                                showConfirmButton: true,
                                confirmButtonText: "I Agree",
                                showDenyButton: true,
                                denyButtonText: "I Don't Agree",
                                allowOutsideClick: false,
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    Swal.fire({
                                        icon: "warning",
                                        title: "Please wait...",
                                        text: "Placing order...",
                                        footer: "DO NOT CLOSE THIS WEBSITE!",
                                        showConfirmButton: false,
                                        allowOutsideClick: false,
                                    });
                                    Swal.showLoading();
                                    fetch("https://itsgrantie.autocode.dev/msg@dev/sendMyself/", {
                                        method: "POST",
                                        body: JSON.stringify({
                                            msg: `🆕 A new order has been placed on Grantie Loom Bracelets! Student Name: ${student.val()} - Student ID: ${studentID} - Type: ${type} - Price: ${product.val()} - Colors: ${colors}`,
                                        }),
                                    }).then(() => {
                                        Swal.fire({
                                            icon: "success",
                                            title: "Order Placed",
                                            text: "Thank you for ordering!",
                                            confirmButtonText: "Close",
                                        }).then((result) => {
                                            document.body.innerHTML = "Reloading fields, please wait...";
                                            window.location = "/";
                                            document.location.reload();
                                        }).catch((e) => {
                                            Swal.fire({
                                                icon: "error",
                                                title: "Order NOT Placed",
                                                text: "There was an error with placing your order. Please contact Grant with the error code below.",
                                                footer: e,
                                                confirmButtonText: "Close",
                                            });
                                        });
                                    });
                                } else if (result.isDenied) {
                                    return Swal.fire({
                                        icon: "error",
                                        title: "Error",
                                        text: "Please agree to place your order.",
                                        toast: true,
                                        position: "top-end",
                                        showConfirmButton: false,
                                        timer: 10000,
                                        timerProgressBar: true,
                                    });
                                }
                            });
                        }
                    });
                } else if (result.isDenied) {
                    return Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "Please enter your student ID again.",
                        toast: true,
                        position: "top-end",
                        showConfirmButton: false,
                        timer: 10000,
                        timerProgressBar: true,
                    });
                }
            });
        }
    });
});
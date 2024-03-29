(function($) {

	"use strict";

// Setup the calendar with the current date
$(document).ready(function(){
    var date = new Date();
    var today = date.getDate();
    // Set click handlers for DOM elements
    $(".right-button").click({date: date}, next_year);
    $(".left-button").click({date: date}, prev_year);
    $(".month").click({date: date}, month_click);
    $("#add-button").click({date: date}, new_event);
    // Set current month as active
    $(".months-row").children().eq(date.getMonth()).addClass("active-month");
    init_calendar(date);
    var events = check_events(today, date.getMonth()+1, date.getFullYear());
    show_events(events, months[date.getMonth()], today);
});

// Initialize the calendar by appending the HTML dates
function init_calendar(date) {
    $(".tbody").empty();
    $(".events-container").empty();
    var calendar_days = $(".tbody");
    var month = date.getMonth();
    var year = date.getFullYear();
    var day_count = days_in_month(month, year);
    var row = $("<tr class='table-row'></tr>");
    var today = date.getDate();
    // Set date to 1 to find the first day of the month
    date.setDate(1);
    var first_day = date.getDay();
    // 35+firstDay is the number of date elements to be added to the dates table
    // 35 is from (7 days in a week) * (up to 5 rows of dates in a month)
    for(var i=0; i<35+first_day; i++) {
        // Since some of the elements will be blank, 
        // need to calculate actual date from index
        var day = i-first_day+1;
        // If it is a sunday, make a new row
        if(i%7===0) {
            calendar_days.append(row);
            row = $("<tr class='table-row'></tr>");
        }
        // if current index isn't a day in this month, make it blank
        if(i < first_day || day > day_count) {
            var curr_date = $("<td class='table-date nil'>"+"</td>");
            row.append(curr_date);
        }   
        else {
            var curr_date = $("<td class='table-date'>"+day+"</td>");
            var events = check_events(day, month+1, year);
            if(today===day && $(".active-date").length===0) {
                curr_date.addClass("active-date");
                show_events(events, months[month], day);
            }
            // If this date has any events, style it with .event-date
            if(events.length!==0) {
                curr_date.addClass("event-date");
            }
            // Set onClick handler for clicking a date
            curr_date.click({events: events, month: months[month], day:day}, date_click);
            row.append(curr_date);
        }
    }
    // Append the last row and set the current year
    calendar_days.append(row);
    $(".year").text(year);
}

// Get the number of days in a given month/year
function days_in_month(month, year) {
    var monthStart = new Date(year, month, 1);
    var monthEnd = new Date(year, month + 1, 1);
    return (monthEnd - monthStart) / (1000 * 60 * 60 * 24);    
}

// Event handler for when a date is clicked
function date_click(event) {
    $(".events-container").show(250);
    $("#dialog").hide(250);
    $(".active-date").removeClass("active-date");
    $(this).addClass("active-date");
    show_events(event.data.events, event.data.month, event.data.day);
};

// Event handler for when a month is clicked
function month_click(event) {
    $(".events-container").show(250);
    $("#dialog").hide(250);
    var date = event.data.date;
    $(".active-month").removeClass("active-month");
    $(this).addClass("active-month");
    var new_month = $(".month").index(this);
    date.setMonth(new_month);
    init_calendar(date);
}

// Event handler for when the year right-button is clicked
function next_year(event) {
    $("#dialog").hide(250);
    var date = event.data.date;
    var new_year = date.getFullYear()+1;
    $("year").html(new_year);
    date.setFullYear(new_year);
    init_calendar(date);
}

// Event handler for when the year left-button is clicked
function prev_year(event) {
    $("#dialog").hide(250);
    var date = event.data.date;
    var new_year = date.getFullYear()-1;
    $("year").html(new_year);
    date.setFullYear(new_year);
    init_calendar(date);
}

// Event handler for clicking the new event button
function new_event(event) {
    // if a date isn't selected then do nothing
    if($(".active-date").length===0)
        return;
    // remove red error input on click
    $("input").click(function(){
        $(this).removeClass("error-input");
    })
    // empty inputs and hide events
    $("#dialog input[type=text]").val('');
    $("#dialog input[type=number]").val('');
    $(".events-container").hide(250);
    $("#dialog").show(250);
    // Event handler for cancel button
    $("#cancel-button").click(function() {
        $("#name").removeClass("error-input");
        $("#count").removeClass("error-input");
        $("#dialog").hide(250);
        $(".events-container").show(250);
    });
    // Event handler for ok button
    $("#ok-button").unbind().click({date: event.data.date}, function() {
        var date = event.data.date;
        var name = $("#name").val().trim();
        var count = parseInt($("#count").val().trim());
        var day = parseInt($(".active-date").html());
        // Basic form validation
        if(name.length === 0) {
            $("#name").addClass("error-input");
        }
        else if(isNaN(count)) {
            $("#count").addClass("error-input");
        }
        else {
            $("#dialog").hide(250);
            console.log("new event");
            new_event_json(name, count, date, day);
            date.setDate(day);
            init_calendar(date);
        }
    });
}

// Adds a json event to event_data
function new_event_json(name, desc, date, day) {
    var event = {
        "occasion": name,
        "description": desc,
        "year": date.getFullYear(),
        "month": date.getMonth()+1,
        "day": day
    };
    event_data["events"].push(event);
}

// Display all events of the selected date in card views
function show_events(events, month, day) {
    // Clear the dates container
    $(".events-container").empty();
    $(".events-container").show(250);
    console.log(event_data["events"]);
    // If there are no events for this date, notify the user
    if(events.length===0) {
        var event_card = $("<div class='event-card'></div>");
        var event_name = $("<div class='event-name'>There are no online class for "+month+" "+day+".</div>");
        $(event_card).css({ "border-left": "10px solid #FF1744" });
        $(event_card).append(event_name);
        $(".events-container").append(event_card);
    }
    else {
        // Go through and add each event as a card to the events container
        for(var i=0; i<events.length; i++) {
            var event_card = $("<div class='event-card'></div>");
            var event_name = $("<div class='event-name' style='color:blue; font-weight:bold; font-size:18px;'>"+events[i]["occasion"]+":</div>");
            var event_count = $("<br><div class='event-count'>"+events[i]["description"]+"</div>");
            if(events[i]["cancelled"]===true) {
                $(event_card).css({
                    "border-left": "10px solid #FF1744"
                });
                event_count = $("<div class='event-cancelled'>Cancelled</div>");
            }
            $(event_card).append(event_name).append(event_count);
            $(".events-container").append(event_card);
        }
    }
}

// Checks if a specific date has any events
function check_events(day, month, year) {
    var events = [];
    for(var i=0; i<event_data["events"].length; i++) {
        var event = event_data["events"][i];
        if(event["day"]===day &&
            event["month"]===month &&
            event["year"]===year) {
                events.push(event);
            }
    }
    return events;
}

// Given data for events in JSON format
var event_data = {
    "events": [
    {
        "occasion": "Introduction to Programming",
        "description": "<ul><li>Perkenalan dengan Mentor dan teman-teman sekelas.</li><li>Persiapan tools yang dibutuhkan untuk proses pembelajaran.</li><li>Q&A dengan mentor.</li></ul>",
        "year": 2024,
        "month": 2,
        "day": 19,
        "cancelled": false
    },
    {
        "occasion": "SQL Fundamentals",
        "description": "<ul><li>Pengenalan Database.</li><li>Mempelajari struktur data, hubungan entitas, dan atribut dalam perancangan basis data.</li></span></ul>",
        "year": 2024,
        "month": 2,
        "day": 20,
        "cancelled": false
    },
    {
        "occasion": "SQL Fundamentals",
        "description": "<ul><li>Mempelajari Data Definition Language (DDL)</li><li>Data Type, Constraint, Relations</li><li>Merancang basis data dengan query DDL, DQL, dan DML</li></ul>",
        "year": 2024,
        "month": 2,
        "day": 21,
        "cancelled": false
    },
    {
        "occasion": "SQL Fundamentals",
        "description": "<ul><li>Mempelajari DML (Data Manipulation Language).</li><li>Mempelajari cara kerja query SELECT, INSERT, UPDATE, DELETE, dan klausa WHERE.</li></ul>",
        "year": 2024,
        "month": 2,
        "day": 22,
        "cancelled": false
    },
    {
        "occasion": "SQL Fundamentals",
        "description": "<ul><li>Mempelajari DQL (Data Query Language).</li><li>Memahami Query ORDER BY, GROUP BY, HAVING.</li><li>Memahami Aggregate Function pada SQL.</li><li>Mempelajari jenis-jenis JOIN.</li></ul>",
        "year": 2024,
        "month": 2,
        "day": 23,
        "cancelled": false
    },
    {
        "occasion": "Java Fundamentals",
        "description": "<ul><li>Instalasi Java.</li><li>Pengenalan Java Programming.</li><li>Membuat project Java.</li><li>Mempelajari Java Syntax & Comment.</li><li>Mempelajari Data Type (Primitive, Variable, Konstanta, dan Array).</li></ul>",
        "year": 2024,
        "month": 2,
        "day": 26,
        "cancelled": false
    },
    {
        "occasion": "OOP Concept",
        "description": "<ul><li>Belajar jenis-jenis operator yang ada di Java.</li><li>Belajar tentang Decision (if else statement, switch case).</li><li>Belajar tentang perulangan (While, do While, For i, For each).</li><li>Belajar tentang Method void dan non void serta penggunaan static pada method.</li><li>Pengenalan tentang OOP pada Java.</li><li>Belajar cara membuat Object dan Class pada Java.</li><li>Belajar tentang Inheritance (Pewarisan).</li><li>Belajar tentang Polimorfisme pada OOP.</li><li>Belajar tentang Enkasulapsi (Getter & Setter).</li><li>Belajar tentang Access Modifier.</li><li>Memahami tentang Perbedaan overloading dan overriding.</li><li>Belajar tentang Abstraction , dan interface pada OOP.</li></ul>",
        "year": 2024,
        "month": 2,
        "day": 27,
        "cancelled": false
    },
    {
        "occasion": "Git",
        "description": "<ul><li>Belajar tentang GIT Versioning.</li><li>Praktek melakukan konfigurasi awal pada akun GIT dan GITHub.</li><li>Memahami tentang Git state Operation dan File status life cycle pada Git.</li><li>Praktek melakukan fast forward dan Three way merging serta solved conflict.</li><li>Memahami cara pull request di github.</li><li>Memahami Istilah dasar GIT yang sering digunakan.</li></ul>",
        "year": 2024,
        "month": 2,
        "day": 28,
        "cancelled": false
    },
    {
        "occasion": "Git",
        "description": "<ul><li>Membahas tuntas tentang tugas Git Versioning yang diberikan pada tanggal 28-02-2024.</li><li>Review ulang cara melakukan Git add, Git Pull , Git merge, Pull request , Fast Forward, Three way merging.</li></ul>",
        "year": 2024,
        "month": 2,
        "day": 29,
        "cancelled": false
    },
    {
        "occasion": "JDBC & MVC",
        "description": "<ul><li>Belajar tentang cara menggunakan library JDBC.</li><li>Belajar tentang konsep MVC (Model , View, dan Controller).</li><li>Belajar tentang cara menggunakan Class Collection di java.</li><li>Belajar tentang cara menggunakan Class Scanner jada Java.util.</li></ul>",
        "year": 2024,
        "month": 3,
        "day": 1,
        "cancelled": false
    },
    // Java Programming I
    {
        "occasion": "Java Programming I",
        "description": "<ul><li>Java Database Connectivity (JDBC)</li><li>Model, View, and Controller</li><li>Spring Boot</li><li>Object Relational Mapping (ORM)</li></ul>",
        "year": 2024,
        "month": 3,
        "day": 18,
        "cancelled": false
    },
    {
        "occasion": "Java Programming I",
        "description": "<ul><li>Java Database Connectivity (JDBC)</li><li>Model, View, and Controller</li><li>Spring Boot</li><li>Object Relational Mapping (ORM)</li></ul>",
        "year": 2024,
        "month": 3,
        "day": 19,
        "cancelled": false
    },
    {
        "occasion": "Java Programming I",
        "description": "<ul><li>Java Database Connectivity (JDBC)</li><li>Model, View, and Controller</li><li>Spring Boot</li><li>Object Relational Mapping (ORM)</li></ul>",
        "year": 2024,
        "month": 3,
        "day": 20,
        "cancelled": false
    },
    {
        "occasion": "Java Programming I",
        "description": "<ul><li>Java Database Connectivity (JDBC)</li><li>Model, View, and Controller</li><li>Spring Boot</li><li>Object Relational Mapping (ORM)</li></ul>",
        "year": 2024,
        "month": 3,
        "day": 21,
        "cancelled": false
    },
    {
        "occasion": "Java Programming I",
        "description": "<ul><li>Java Database Connectivity (JDBC)</li><li>Model, View, and Controller</li><li>Spring Boot</li><li>Object Relational Mapping (ORM)</li></ul>",
        "year": 2024,
        "month": 3,
        "day": 22,
        "cancelled": false
    },
    {
        "occasion": "Java Programming I",
        "description": "<ul><li>Java Database Connectivity (JDBC)</li><li>Model, View, and Controller</li><li>Spring Boot</li><li>Object Relational Mapping (ORM)</li></ul>",
        "year": 2024,
        "month": 3,
        "day": 25,
        "cancelled": false
    },
    {
        "occasion": "Java Programming I",
        "description": "<ul><li>Java Database Connectivity (JDBC)</li><li>Model, View, and Controller</li><li>Spring Boot</li><li>Object Relational Mapping (ORM)</li></ul>",
        "year": 2024,
        "month": 3,
        "day": 26,
        "cancelled": false
    },
    {
        "occasion": "Java Programming I",
        "description": "<ul><li>Java Database Connectivity (JDBC)</li><li>Model, View, and Controller</li><li>Spring Boot</li><li>Object Relational Mapping (ORM)</li></ul>",
        "year": 2024,
        "month": 3,
        "day": 27,
        "cancelled": false
    },
    {
        "occasion": "Java Programming I",
        "description": "<ul><li>Java Database Connectivity (JDBC)</li><li>Model, View, and Controller</li><li>Spring Boot</li><li>Object Relational Mapping (ORM)</li></ul>",
        "year": 2024,
        "month": 3,
        "day": 28,
        "cancelled": false
    },
    {
        "occasion": "Java Programming I",
        "description": "<ul><li>Java Database Connectivity (JDBC)</li><li>Model, View, and Controller</li><li>Spring Boot</li><li>Object Relational Mapping (ORM)</li></ul>",
        "year": 2024,
        "month": 3,
        "day": 29,
        "cancelled": false
    },
    // Java Programming II
    {
        "occasion": "Java Programming II",
        "description": "<ul><li>System Architetcure</li><li>Representation State Transfer (REST)</li><li>Web Design</li><li>JavaScript</li><li>Consume API</li></ul>",
        "year": 2024,
        "month": 4,
        "day": 17,
        "cancelled": false
    },
    {
        "occasion": "Java Programming II",
        "description": "<ul><li>System Architetcure</li><li>Representation State Transfer (REST)</li><li>Web Design</li><li>JavaScript</li><li>Consume API</li></ul>",
        "year": 2024,
        "month": 4,
        "day": 18,
        "cancelled": false
    },
    {
        "occasion": "Java Programming II",
        "description": "<ul><li>System Architetcure</li><li>Representation State Transfer (REST)</li><li>Web Design</li><li>JavaScript</li><li>Consume API</li></ul>",
        "year": 2024,
        "month": 4,
        "day": 19,
        "cancelled": false
    },
    {
        "occasion": "Java Programming II",
        "description": "<ul><li>System Architetcure</li><li>Representation State Transfer (REST)</li><li>Web Design</li><li>JavaScript</li><li>Consume API</li></ul>",
        "year": 2024,
        "month": 4,
        "day": 22,
        "cancelled": false
    },
    {
        "occasion": "Java Programming II",
        "description": "<ul><li>System Architetcure</li><li>Representation State Transfer (REST)</li><li>Web Design</li><li>JavaScript</li><li>Consume API</li></ul>",
        "year": 2024,
        "month": 4,
        "day": 23,
        "cancelled": false
    },
    {
        "occasion": "Java Programming II",
        "description": "<ul><li>System Architetcure</li><li>Representation State Transfer (REST)</li><li>Web Design</li><li>JavaScript</li><li>Consume API</li></ul>",
        "year": 2024,
        "month": 4,
        "day": 24,
        "cancelled": false
    },
    {
        "occasion": "Java Programming II",
        "description": "<ul><li>System Architetcure</li><li>Representation State Transfer (REST)</li><li>Web Design</li><li>JavaScript</li><li>Consume API</li></ul>",
        "year": 2024,
        "month": 4,
        "day": 25,
        "cancelled": false
    },
    {
        "occasion": "Java Programming II",
        "description": "<ul><li>System Architetcure</li><li>Representation State Transfer (REST)</li><li>Web Design</li><li>JavaScript</li><li>Consume API</li></ul>",
        "year": 2024,
        "month": 4,
        "day": 26,
        "cancelled": false
    },
    {
        "occasion": "Java Programming II",
        "description": "<ul><li>System Architetcure</li><li>Representation State Transfer (REST)</li><li>Web Design</li><li>JavaScript</li><li>Consume API</li></ul>",
        "year": 2024,
        "month": 4,
        "day": 29,
        "cancelled": false
    },
    {
        "occasion": "Java Programming II",
        "description": "<ul><li>System Architetcure</li><li>Representation State Transfer (REST)</li><li>Web Design</li><li>JavaScript</li><li>Consume API</li></ul>",
        "year": 2024,
        "month": 4,
        "day": 30,
        "cancelled": false
    },
    {
        "occasion": "Java Programming II",
        "description": "<ul><li>Consume API",
        "year": 2024,
        "month": 5,
        "day": 27,
        "cancelled": false
    },
    {
        "occasion": "Java Programming II",
        "description": "<ul><li>Consume API",
        "year": 2024,
        "month": 5,
        "day": 28,
        "cancelled": false
    },
    {
        "occasion": "Java Programming II",
        "description": "<ul><li>Consume API",
        "year": 2024,
        "month": 5,
        "day": 29,
        "cancelled": false
    },
    {
        "occasion": "Java Programming II",
        "description": "<ul><li>Consume API",
        "year": 2024,
        "month": 5,
        "day": 30,
        "cancelled": false
    },
    {
        "occasion": "Java Programming II",
        "description": "<ul><li>Consume API",
        "year": 2024,
        "month": 5,
        "day": 31,
        "cancelled": false
    },
    // Certified Application Security Engineer (CASE)
    {
        "occasion": "Certified Application Security Engineer (CASE)",
        "description": "<ul><li>Understanding Application Security, Threats, and Attacks</li><li>Security Requirements Gathering</li><li>Secure Application Design and Architecture</li><li>Secure Coding Practices for Input Validation</li></ul>",
        "year": 2024,
        "month": 5,
        "day": 6,
        "cancelled": false
    },
    {
        "occasion": "Certified Application Security Engineer (CASE)",
        "description": "<ul><li>Understanding Application Security, Threats, and Attacks</li><li>Security Requirements Gathering</li><li>Secure Application Design and Architecture</li><li>Secure Coding Practices for Input Validation</li></ul>",
        "year": 2024,
        "month": 5,
        "day": 7,
        "cancelled": false
    },
    {
        "occasion": "Certified Application Security Engineer (CASE)",
        "description": "<ul><li>Understanding Application Security, Threats, and Attacks</li><li>Security Requirements Gathering</li><li>Secure Application Design and Architecture</li><li>Secure Coding Practices for Input Validation</li></ul>",
        "year": 2024,
        "month": 5,
        "day": 8,
        "cancelled": false
    },
    {
        "occasion": "Certified Application Security Engineer (CASE)",
        "description": "<ul><li>Understanding Application Security, Threats, and Attacks</li><li>Security Requirements Gathering</li><li>Secure Application Design and Architecture</li><li>Secure Coding Practices for Input Validation</li></ul>",
        "year": 2024,
        "month": 5,
        "day": 9,
        "cancelled": false
    },
    {
        "occasion": "Certified Application Security Engineer (CASE)",
        "description": "<ul><li>Understanding Application Security, Threats, and Attacks</li><li>Security Requirements Gathering</li><li>Secure Application Design and Architecture</li><li>Secure Coding Practices for Input Validation</li></ul>",
        "year": 2024,
        "month": 5,
        "day": 10,
        "cancelled": false
    },
    {
        "occasion": "Certified Application Security Engineer (CASE)",
        "description": "<ul><li>Secure Coding Practices for Authentication & Authorization</li><li>Secure Coding Practices for Cryptography</li><li>Secure Coding Practices for Session Management</li></ul>",
        "year": 2024,
        "month": 5,
        "day": 13,
        "cancelled": false
    },
    {
        "occasion": "Certified Application Security Engineer (CASE)",
        "description": "<ul><li>Secure Coding Practices for Authentication & Authorization</li><li>Secure Coding Practices for Cryptography</li><li>Secure Coding Practices for Session Management</li></ul>",
        "year": 2024,
        "month": 5,
        "day": 14,
        "cancelled": false
    },
    {
        "occasion": "Certified Application Security Engineer (CASE)",
        "description": "<ul><li>Secure Coding Practices for Authentication & Authorization</li><li>Secure Coding Practices for Cryptography</li><li>Secure Coding Practices for Session Management</li></ul>",
        "year": 2024,
        "month": 5,
        "day": 15,
        "cancelled": false
    },
    {
        "occasion": "Certified Application Security Engineer (CASE)",
        "description": "<ul><li>Secure Coding Practices for Authentication & Authorization</li><li>Secure Coding Practices for Cryptography</li><li>Secure Coding Practices for Session Management</li></ul>",
        "year": 2024,
        "month": 5,
        "day": 16,
        "cancelled": false
    },
    {
        "occasion": "Certified Application Security Engineer (CASE)",
        "description": "<ul><li>Secure Coding Practices for Authentication & Authorization</li><li>Secure Coding Practices for Cryptography</li><li>Secure Coding Practices for Session Management</li></ul>",
        "year": 2024,
        "month": 5,
        "day": 17,
        "cancelled": false
    },
    {
        "occasion": "Certified Application Security Engineer (CASE)",
        "description": "<ul><li>Secure Coding Practices for Error Handling</li><li>Static and Dynamic Application Security Testing (SAST & DAST)</li><li>Secure Deployment and maintenance</li></ul>",
        "year": 2024,
        "month": 5,
        "day": 20,
        "cancelled": false
    },
    {
        "occasion": "Certified Application Security Engineer (CASE)",
        "description": "<ul><li>Secure Coding Practices for Error Handling</li><li>Static and Dynamic Application Security Testing (SAST & DAST)</li><li>Secure Deployment and maintenance</li></ul>",
        "year": 2024,
        "month": 5,
        "day": 21,
        "cancelled": false
    },
    {
        "occasion": "Certified Application Security Engineer (CASE)",
        "description": "<ul><li>Secure Coding Practices for Error Handling</li><li>Static and Dynamic Application Security Testing (SAST & DAST)</li><li>Secure Deployment and maintenance</li></ul>",
        "year": 2024,
        "month": 5,
        "day": 22,
        "cancelled": false
    },
    {
        "occasion": "Certified Application Security Engineer (CASE)",
        "description": "<ul><li>Secure Coding Practices for Error Handling</li><li>Static and Dynamic Application Security Testing (SAST & DAST)</li><li>Secure Deployment and maintenance</li></ul>",
        "year": 2024,
        "month": 5,
        "day": 23,
        "cancelled": false
    },
    {
        "occasion": "Certified Application Security Engineer (CASE)",
        "description": "<ul><li>Secure Coding Practices for Error Handling</li><li>Static and Dynamic Application Security Testing (SAST & DAST)</li><li>Secure Deployment and maintenance</li></ul>",
        "year": 2024,
        "month": 5,
        "day": 24,
        "cancelled": false
    },
    // Final Project and Showcase
    {
        "occasion": "[Start] Final Project and Showcase",
        "description": "<ul><li>Final Project and Showcase</li><li>Exam Preparation</li><li>Exam Certification</li></ul>",
        "year": 2024,
        "month": 6,
        "day": 3,
        "cancelled": false
    },
    {
        "occasion": "[End] Final Project and Showcase",
        "description": "<ul><li>Final Project and Showcase</li><li>Exam Preparation</li><li>Exam Certification</li></ul>",
        "year": 2024,
        "month": 6,
        "day": 28,
        "cancelled": false
    }
    ]
};

const months = [ 
    "January", 
    "February", 
    "March", 
    "April", 
    "May", 
    "June", 
    "July", 
    "August", 
    "September", 
    "October", 
    "November", 
    "December" 
];

})(jQuery);


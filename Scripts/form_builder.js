function debug(msg) {console.log(msg);}

class Condition {
    constructor(name, statement, value) {
        this.name = name;
        this.statement = statement;
        this.value = value;
    }

    async fillFromJson(json) {
        this.name = json["name"];
        this.statement = json["statement"];
        this.value = json["value"];
        return this;
    }
}

class ConditionsGroup {
    constructor(type, conditions = []) {
        this.type = type;
        this.conditions = conditions;
    }

    async fillFromJson(json) {
        this.type = json["type"];

        await json["fields"].forEach(condition => {
            new Condition("", "", "").fillFromJson(condition)
                .then(result => this.conditions.push(result));
        });
        return this;
    }
}

class SelOption {
    constructor(value, label, isDefault = false, conditions = []) {
        this.value = value;
        this.label = label;
        this.isDefault = isDefault;
        this.conditions = conditions;
    }

    async fillFromJson(json) {
        this.value = json["value"];
        this.label = json["label"];
        this.isDefault = json["is_default"];
        this.isDisabled = json["is_disabled"];

        this.html = document.createElement("option");
        this.html.value = this.value;
        this.html.innerText = this.label;
        if (this.isDefault) { this.html.setAttribute("selected", true); }
        if (this.isDisabled) { this.html.setAttribute("disabled", true); }

        await json["conditions_groups"].forEach(condition => {
            new Condition("", "", "").fillFromJson(condition)
                .then(result => this.conditions.push(result));
        });
        return this;
    }
}

class Field {
    constructor(
        name,
        type,
        label,
        placeholder = "",
        isRequired = false,
        isHidden = false,
        selOptions = [],
        conditions = []
    ) {
        this.name = name;
        this.type = type;
        this.label = label;
        this.placeholder = placeholder;
        this.isRequired = isRequired;
        this.isHidden = isHidden;
        this.selOptions = selOptions;
        this.conditions = conditions;
    }

    async fillFromJson(json, formID) {
        this.name = json["name"];
        this.type = json["type"];
        this.label = json["label"];
        this.placeholder = json["placeholder"];
        this.isRequired = json["is_required"];
        this.isHidden = json["is_hidden"];

        const DATA_BY_TYPE = {
            "text": {
                "tag": "input",
                "content": null,
                "onchange": (e) => {console.log(e);}
            },
            "select": {
                "tag": "select",
                "content": null,
                "onchange": (e) => {console.log(e);}
            },
            "phone": {
                "tag": "input",
                "content": null,
                "onchange": (e) => {console.log(e);}
            },
            "email": {
                "tag": "input",
                "content": null,
                "onchange": (e) => {console.log(e);}
            },
            "date": {
                "tag": "input",
                "content": null,
                "onchange": (e) => {console.log(e);}
            },
            "file": {
                "tag": "input",
                "content": (e) => {
                    content = document.createElement("img");
                    content.src = "/Static/Pics/file_dropzone.png";
                    return content;
                },
                "onchange": (e) => {
                    e.target.parentElement.style.height = "80px";
                    this.fileName = document.createElement("p");
                    this.fileName.innerText = e.target.files[0].name;
                    e.target.parentElement.append(this.fileName);
                }
            }
        }
        this.html = document.createElement("div");
        this.lbl = document.createElement("label");
        this.extra = document.createElement("label");
        this.field = document.createElement(DATA_BY_TYPE[this.type]["tag"]);

        if (this.field.type != this.type) {
            this.field.setAttribute("type", this.type);
        }

        this.html.className = "form_field_wrap " + this.type;
        this.html.id = this.name;

        this.field.className = "form_field " + this.type;
        this.field.id = this.name + "_field";
        this.field.setAttribute("form", formID);
        this.field.onchange = DATA_BY_TYPE[this.type]["onchange"];

        this.lbl.innerText = this.label;
        this.lbl.className = "form_field_label " + this.type;
        this.lbl.setAttribute("for", this.field.id);

        this.extra.className = "form_field_extra " + this.type;
        this.extra.setAttribute("for", this.field.id);
        console.log(DATA_BY_TYPE[this.type]["content"]);

        if (this.isRequired) {
            this.lbl.innerText += " *";
            this.field.toggleAttribute("required", true);
        }

        this.html.append(this.lbl);
        this.extra.append(this.field);
        this.html.append(this.extra);

        await json["sel_options"].forEach(option => {
            new SelOption("", "").fillFromJson(option)
                .then(result => {
                    this.selOptions.push(result);
                    this.html.querySelector("select").append(result.html);
                });
        });
        await json["conditions_groups"].forEach(condition => {
            new ConditionsGroup("", "").fillFromJson(condition)
                .then(result => this.conditions.push(result));
        });
        return this;
    }
}

class FieldsGroup {
    constructor(name, label = "", fields = [], conditions = []) {
        this.name = name;
        this.label = label;
        this.fields = fields;
        this.conditions = conditions;

        this.html = document.createElement("details");
        this.html.className = "fields_group";
        this.html.toggleAttribute("open", true);
    }

    async fillFromJson(json, formID) {
        this.name = json["name"];
        this.label = json["label"];
        this.html.id = this.name;
        this.title = document.createElement("summary");
        this.title.innerText = this.label;
        this.title.className = "fields_group_title";
        this.html.append(this.title);

        await json["fields"].forEach(field => {
            new Field("", "", "").fillFromJson(field, formID)
                .then(result => {
                    this.fields.push(result);
                    this.html.append(result.html);
                });
        });
        await json["conditions_groups"].forEach(condition => {
            new ConditionsGroup("", "").fillFromJson(condition)
                .then(result => this.conditions.push(result));
        });
        return this;
    }
}

class Form {
    constructor(name, title, isActive, fieldGroups = []) {
        this.name = name;
        this.title = title;
        this.isActive = isActive;
        this.fieldGroups = fieldGroups;

        this.html = document.createElement("form");
        this.html.className = "generated_form";
        this.html.method = "POST";
        this.html.action = "console.log('Form has been submitted.')";
        this.html.id = this.name;
    }

    async fillFromJson(json) {
        this.name = json["form_name"];
        this.title = json["title"];
        this.isActive = json["is_active"];
        this.html.id = this.name;

        await json["field_groups"].forEach(fieldGroup => {
            new FieldsGroup("").fillFromJson(fieldGroup, this.name)
                .then(result => {
                    this.fieldGroups.push(result);
                    this.html.append(result.html);
                });
        });
        console.log("Form JSON: ", json, "\nResult Form: ", this);
        return this;
    }
}

function setForms() {
    document.querySelectorAll(".form_anchor").forEach(formAnchor => {
        let formName = formAnchor.getAttribute("id");
        let form = new Form("", "", true);
        fetch("/Forms/" + formName + ".jsonc")
            .then(response => response.json())
            .then(json => form.fillFromJson(json));
        formAnchor.appendChild(form.html);
    });
}
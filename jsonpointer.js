var untilde = function(str) {
  return str.replace(/~./g, function(m) {
    switch (m) {
      case "~0":
        return "~";
      case "~1":
        return "/";
    }
    throw new Error("Invalid tilde escape: " + m);
  });
}

var traverse = function(obj, pointer, value) {
  var part = untilde(pointer.shift());
  var isJustReading = arguments.length === 2;

  if (obj[part] == null) {
    if (isJustReading) return null;

    // support setting of /-
    if (part === '-' && obj instanceof Array) {
      part = obj.length;
    }

    // support nested objects/array when setting values
    var nextPart = pointer[0];
    if (nextPart === '-' || !isNaN(nextPart)) {
      obj[part] = [];
    } else if (nextPart) {
      obj[part] = {};
    }
  }

  // keep traversing
  if (pointer.length !== 0) {
    if (isJustReading) {
      return traverse(obj[part], pointer);
    } else {
      return traverse(obj[part], pointer, value);
    }
  }

  // we're done
  if (isJustReading) {
    return obj[part];
  }

  // set new value, return old value
  var oldValue = obj[part];
  if (value === null) {
    delete obj[part];
  } else {
    obj[part] = value;
  }
  return oldValue;
}

var compilePointer = function(pointer) {
  if(pointer === "") {
    return [];
  }

  if(!pointer) {
    throw new Error("Invalid JSON pointer.");
  }

  if (!(pointer instanceof Array)) {
    pointer = pointer.split("/");
    if (pointer.shift() !== "") throw new Error("Invalid JSON pointer.")
  }

  return pointer;
}

var validate_input = function(obj, pointer) {
  if(typeof obj !== "object") {
    throw new Error("Invalid input object.");
  }

  return compilePointer(pointer);
}

var get = function(obj, pointer) {
  pointer = validate_input(obj, pointer);
  if (pointer.length === 0) {
    return obj;
  }
  return traverse(obj, pointer);
}

var set = function(obj, pointer, value) {
  pointer = validate_input(obj, pointer);
  if (pointer.length === 0) {
    throw new Error("Invalid JSON pointer for set.")
  }
  return traverse(obj, pointer, value);
}

exports.get = get
exports.set = set

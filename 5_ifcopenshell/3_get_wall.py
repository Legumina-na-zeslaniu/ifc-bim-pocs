import ifcopenshell

print(ifcopenshell.version)

model = ifcopenshell.open("model.ifc")
walls = model.by_type("IfcWall")

for wall in walls:
    print(wall.Name)